"""Swarm-client launching proxy for starting a native Docker container or a Docker-based app in Cloud Foundry.

Design considerations:
    1. It should terminate when swarm-client is terminated and returns the same code as swarm-client does.
    2. It should terminate swam-client when it receives signals to terminate (such as ctrl-c events).
    3. It should redirect standard output and standard error of swarm-client when swarm-client is working.
    4. It should open a simple http service at the specified port when the PORT environment variable is present and the swarm-client is connected to the Jenkins server.
"""
import datetime
import http.server
import io
import os
import shutil
import signal
import subprocess
import sys
import threading

from http import HTTPStatus

__version__ = "0.1"
__author__ = "Kuan-Li Peng"


class SignalDB:
    """Storing signal received that will be shared among threads or sub processes
    """
    def __init__(self):
        self._signal = None;

    def set(self, signal_num):
        self._signal = signal_num

    def get(self):
        return self._signal


class MinimalHTTPRequestHandler(http.server.BaseHTTPRequestHandler):

    """Simple HTTP request handler with GET and HEAD commands.

    This class is simplified from http.server.SimpleHTTPRequestHandler
    and always returns the same static Web contents on the
    GET and HEAD requests.

    The GET and HEAD requests are identical except that the HEAD
    request omits the actual contents of the file.

    """

    server_version = "MinimalHTTP/0.1"

    response_contents = \
            '''<!DOCTYPE html>
            <html>
            <head><meta charset='utf-8'><title>ITRI TaaS Slave</title></head>
            <body>ITRI TaaS slave is connected.</body>
            </html>
            '''.encode()

    contents_modification_time = datetime.datetime(2016, 12, 7, 10, 30).timestamp()

    def do_GET(self):
        """Serve a GET request."""
        f = self.send_head()
        if f:
            try:
                self.copyfile(f, self.wfile)
            finally:
                f.close()

    def do_HEAD(self):
        """Serve a HEAD request."""
        f = self.send_head()
        if f:
            f.close()

    def send_head(self):
        """Common code for GET and HEAD commands.

        This sends the response code and MIME headers.

        """
        f = io.BytesIO()
        f.write(self.response_contents)
        f.seek(0)

        self.send_response(http.HTTPStatus.OK)
        self.send_header("Content-type", 'text/html')
        self.send_header("Content-Length", len(self.response_contents))
        self.send_header("Last-Modified", self.date_time_string(self.contents_modification_time))
        self.end_headers()

        return f

    def copyfile(self, source, outputfile):
        """Copy all data between two file objects."""
        shutil.copyfileobj(source, outputfile)


class HTTPWorker(threading.Thread):
    def __init__(self, port):
        threading.Thread.__init__(self, daemon=True)
        self.port = port

    def run(self):
        sys.stderr.write('HTTP server will be listening on port %d...\n' % self.port)
        server_addr = ('', self.port)
        httpd = http.server.HTTPServer(server_addr, MinimalHTTPRequestHandler)
        httpd.serve_forever()


class IORedirectWorker(threading.Thread):
    def __init__(self, io_obj):
        # make it a daemon thread
        threading.Thread.__init__(self, daemon=True)
        self._io_obj = io_obj

    def run(self):
        for line in iter(self._io_obj.readline, ''):
            # line returned from readline is always ended with '\n'
            sys.stdout.write(line)
            if line.endswith(': Connected\n'):
                sys.stderr.write('Slave is now connected to Jenkins master\n')
                try:
                    port = int(os.environ['PORT'])
                    http_worker = HTTPWorker(port)
                    http_worker.start()
                except KeyError:
                    sys.stderr.write('$PORT is undefined; http server will not be created\n')
                except ValueError:
                    sys.stderr.write('$PORT is not an integer; http server will not be created\n')


class SwarmClientWorker(threading.Thread):
    def __init__(self, swarm_client_argv, main_thread_event, signal_db):
        threading.Thread.__init__(self)
        self.swarm_client_argv = ['java', '-jar', 'swarm-client.jar'] + list(swarm_client_argv)
        self.main_thread_event = main_thread_event
        self.signal_db = signal_db
        self.stdout_worker = None
        self.stderr_worker = None
        self.exit_code = None

    def run(self):
        self.swarm_client_proc = subprocess.Popen(
                self.swarm_client_argv,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True)
        # redirect stdout and stderr
        self.stdout_worker = IORedirectWorker(self.swarm_client_proc.stdout)
        self.stderr_worker = IORedirectWorker(self.swarm_client_proc.stderr)
        self.stdout_worker.start()
        self.stderr_worker.start()
        while True:
            # swam client terminated
            if self.swarm_client_proc.poll() is not None:
                self.exit_code = self.swarm_client_proc.returncode
                return
            # main thread is about to terminate
            if self.main_thread_event.is_set():
                self.swarm_client_proc.send_signal(self.signal_db.get())
                return


class SignalHandler:
    def __init__(self, main_thread_event, signal_db):
        self.main_thread_event = main_thread_event
        self.signal_db = signal_db

    def handle(self, signal_num, frame):
        sys.stderr.write('Receive signal: %d\n' % signal_num)
        self.signal_db.set(signal_num)
        self.main_thread_event.set()


def main(*argv):
    print('Arguments received: ' + ', '.join(argv))
    main_thread_event = threading.Event()  # used to notify SIGINT, SIGTERM, SIGKILL
    signal_db = SignalDB()  # storing signal received
    signal_handler = SignalHandler(main_thread_event, signal_db)
    signal.signal(signal.SIGINT, signal_handler.handle)
    signal.signal(signal.SIGTERM, signal_handler.handle)
    # SIGKILL cannot be caught,
    # and only the parent process is killed if process-group-kill is not applied
    # signal.signal(signal.SIGKILL, signal_handler.handle)

    swarm_client_worker = SwarmClientWorker(argv, main_thread_event, signal_db)
    swarm_client_worker.start()
    swarm_client_worker.join()

    if signal_db.get() is not None:
        sys.exit(signal_db.get())
    elif swarm_client_worker.exit_code is not None:
        sys.exit(swarm_client_worker.exit_code)
    else:
        sys.exit()


if __name__ == '__main__':
    main(*sys.argv[1:])
