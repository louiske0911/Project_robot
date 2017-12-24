#include <stdio.h>
#include <errno.h>
#include <stdlib.h>
#include <unistd.h>
#include <bluetooth/bluetooth.h>
#include <bluetooth/sdp.h>
#include <bluetooth/sdp_lib.h>
#include <sys/socket.h>
#include <bluetooth/rfcomm.h>

#include <wiringPi.h>
#include <softPwm.h>
#include <softServo.h>
#include <gattlib.h>
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <pthread.h>

#define INITIAL_VALUE 0
#define RANGE	500
#define RANGE_MAX 500
#define GPIO_TRIG 28
#define GPIO_ECHO 29
#define GPIO_TRIG2 26
#define GPIO_ECHO2 27

int static Permission = 0;
int static forwardIndex = 0;
int static dist_right_count = 0;
int static dist_left_count = 0;

void correction_Angle();
void forward();
void backward();
void right();
void left();
void stop();
void rightCorrect();
void leftCorrect();
double distanceSensor();
//
////-- 搜尋遠端 SPP Server 所使用的 RFCOMM Port Number
// 回傳 RFCOMM Port Number

uint8_t get_rfcomm_port_number(const char bta[]) {
	int status;
	bdaddr_t target;
	uuid_t svc_uuid;
	sdp_list_t *response_list, *search_list, *attrid_list;
	sdp_session_t *session = 0;
	uint32_t range = 0x0000ffff;
	uint8_t port = 0;

	str2ba(bta, &target);

	// connect to the SDP server running on the remote machine
	session = sdp_connect( BDADDR_ANY, &target, 0);

	sdp_uuid16_create(&svc_uuid, RFCOMM_UUID);
	search_list = sdp_list_append(0, &svc_uuid);
	attrid_list = sdp_list_append(0, &range);

	// get a list of service records that have UUID 0xabcd
	response_list = NULL;
	status = sdp_service_search_attr_req(session, search_list,
			SDP_ATTR_REQ_RANGE, attrid_list, &response_list);

	if (status == 0) {
		sdp_list_t *proto_list = NULL;
		sdp_list_t *r = response_list;

		// go through each of the service records
		for (; r; r = r->next) {
			sdp_record_t *rec = (sdp_record_t*) r->data;

			// get a list of the protocol sequences
			if (sdp_get_access_protos(rec, &proto_list) == 0) {

				// get the RFCOMM port number
				port = sdp_get_proto_port(proto_list, RFCOMM_UUID);

				sdp_list_free(proto_list, 0);
			}
			sdp_record_free(rec);
		}
	}
	sdp_list_free(response_list, 0);
	sdp_list_free(search_list, 0);
	sdp_list_free(attrid_list, 0);
	sdp_close(session);

	if (port != 0) {
		printf("found service running on RFCOMM port %d\n", port);
	}

	return port;
}

int connect_bluetooth() {
	struct sockaddr_rc addr = { 0 };
	int status, len, rfcommsock;
	char rfcommbuffer[255];

	/*	Android Device's Bluetooth Number List	*/
//	char dest[18] = "4C:21:D0:F0:37:48"; // Sony
//	char dest[18] = "5C:3C:27:47:E8:47"; // Samsung tablet
	char dest[18] = "30:5A:3A:95:EF:0C"; // ASUS Tablet
//	char dest[18] = "2C:8A:72:6D:B9:3B"; // HTC
//	char dest[18] = "B4:3A:28:0D:22:C4"; // Samsung

	// allocate a socket
	rfcommsock = socket(AF_BLUETOOTH, SOCK_STREAM, BTPROTO_RFCOMM);

	// set the connection parameters (who to connect to)
	addr.rc_family = AF_BLUETOOTH;

	// 先找到 SPP Server 可被連接的 Port Number ( or channel number )
	addr.rc_channel = get_rfcomm_port_number(dest);
	str2ba(dest, &addr.rc_bdaddr);

	//  等幾秒鐘之後再連接到 SPP Server
	sleep(5);
	// 連接 SPP Server
	status = connect(rfcommsock, (struct sockaddr *) &addr, sizeof(addr));

//------------------------------------------------------------------------------
	// send/receive messages
	if (status == 0) {

		// say hello to client side
//		status = send(rfcommsock, "hello!", 6, 0);

		if (status < 0) {
			perror("rfcomm send ");
			close(rfcommsock);
			return -1;
		}

		while (1) {
			// 從 RFCOMM socket 讀取資料
			// 這個 socket
			// this socket has blocking turned off so it will never block,
			// even if no data is available
			if (forwardIndex == 1 && Permission == 0)
				forward(480, 1500);

			len = recv(rfcommsock, rfcommbuffer, 255, 0);
			// EWOULDBLOCK indicates the socket would block if we had a
			// blocking socket.  we'll safely continue if we receive that
			// error.  treat all other errors as fatal500
			if (len < 0 && errno != EWOULDBLOCK) {
				perror("rfcomm recv ");
				break;
			} else if (len > 0) {
				// received a message; print it to the screen and
				// return ATOK to the remote device
				rfcommbuffer[len] = '\0';
				printf("\nrfcomm received: %s\n", rfcommbuffer);
				int correctionAngle = atoi(rfcommbuffer);
				if (Permission == 0) {
					if (correctionAngle <= 360 && correctionAngle >= -360) {
						correction_Angle(correctionAngle);
					} else if (correctionAngle == 888) {
						forwardIndex = 1;
					} else if (correctionAngle == 999
							&& correctionAngle == 990) {
						correction_Angle(correctionAngle);
					}
				}
				if (status < 0) {
					perror("rfcomm send ");
					break;
				}
			}
		}
	} else if (status < 0) {
		perror("uh oh");
	}

	close(rfcommsock);
}

void *thread_Fcn(void *parm) {
	/*
	 你的Thread要執行的程式寫在這裡
	 */
	int status;
	status = connect_bluetooth();
//	pthread_exit(NULL);
	//如果Thread內容都跑完了，就呼叫這個函式結束這個Thread     pthread_exit(NULL);
}

void *thread_Avoid(int direction_index) {
	int distance;
	if (direction_index == 1) {
		distance = distanceSensor(GPIO_TRIG2, GPIO_ECHO2, "right", 500);
	} else if (direction_index == 0) {
		distance = distanceSensor(GPIO_TRIG, GPIO_ECHO, "left", 500);
	}
	if (distance > 150) {
		stop();
		pthread_exit(NULL);
	}
//	如果Thread內容都跑完了，就呼叫這個函式結束這個Thread     pthread_exit(NULL);
}

/* Sensor Avoid Function*/
int car_avoid(double distance_right, double distance_left) {
	pthread_t thread_2;

	if ((distance_right < 150) && (distance_left < 150)) {
		dist_right_count += 1;
		dist_left_count += 1;
	} else if (distance_right < 150) {
		dist_right_count += 1;
	} else if (distance_left < 150) {
		dist_left_count += 1;
	} else {
		dist_right_count = 0;
		dist_left_count = 0;
	}

	if ((dist_right_count >= 3) && (dist_left_count >= 3)) {
		Permission = 1;
		correction_Angle(90);
		dist_right_count = 0;
		dist_left_count = 0;
	} else if (dist_right_count >= 3) {
		Permission = 1;
		correction_Angle(-90);
		pthread_create(&thread_2, NULL, thread_Avoid(0), NULL);
		dist_right_count = 0;
	} else if (dist_left_count >= 3) {
		Permission = 1;
		correction_Angle(90);
		pthread_create(&thread_2, NULL, thread_Avoid(1), NULL);
		dist_left_count = 0;
	}
	Permission = 0; 
}

int main(int argc, char **argv) {
	int dist_count;
	int correctionAngle;
	int EXIT_FLAG = 1;
	int temp;
	int delay_time;
	int distance_left, distance_right;

	wiringPiSetup();
	sensorSetup();
	if (wiringPiSetup() == -1) {
		printf("Setup error");
	}

	/*	Create the softPwm and set the Range for Max Speed */
	/*	Can Set 2, 3 for Front tire or Back tire */
	softPwmCreate(2, INITIAL_VALUE, RANGE); 
	softPwmCreate(3, INITIAL_VALUE, RANGE);

	/*	Can Set 0, 1 for Front tire or Back tire */
	softPwmCreate(0, INITIAL_VALUE, RANGE);
	softPwmCreate(1, INITIAL_VALUE, RANGE);

	/*	Right and Left */
	softPwmCreate(24, INITIAL_VALUE, RANGE);
	softPwmCreate(25, INITIAL_VALUE, RANGE);

	pthread_t thread_1;
	int rc1 = 0;
	int rc2 = 0;
	//建立一個 thread
	rc1 = pthread_create(&thread_1, NULL, thread_Fcn, NULL);
	if (rc1 || rc2) {
		//進行檢測，要確定Thread有被正確建立
		printf("ERROR thread create!");
	}

	while (1) {
		printf("input speed:\n");
		scanf("%d", &temp);
		Permission = 1;
		if (temp == 999) {
			forward(450, 1000);
			Permission = 0;
		} else if (temp == 900) {
			stop();
		} else if (temp == 888) {
			forwardIndex = 1;
			printf("forwardIndex = 1");
		} else {
			correction_Angle(temp);
			Permission = 0;
		}
		distance_left = distanceSensor(GPIO_TRIG, GPIO_ECHO,  1000);
		distance_right = distanceSensor(GPIO_TRIG2, GPIO_ECHO2, 1000);
		car_avoid(distance_right, distance_left);
	}
	//等待thread執行結束，否則就一直等著

}


void correction_Angle(int correctionAngle) {
	if (correctionAngle == 999) {
		forward(450, 1000);
	} else if (correctionAngle == 900) {
		stop();
	} else if ((correctionAngle > 180) || (correctionAngle < -180)) {
		if (correctionAngle > 0) {
			correctionAngle = correctionAngle - 360;
			leftCorrect(correctionAngle);
		} else {
			correctionAngle = 360 + correctionAngle;
			rightCorrect(correctionAngle);
		}
	} else {
		if (correctionAngle > 0) {
			rightCorrect(correctionAngle);
		} else {
			leftCorrect(correctionAngle);
		}
	}
}

void forward(int speed, int delay_time) {
	printf(
			"\n##################################### Forward #####################################");
	softPwmWrite(2, 0);
	softPwmWrite(3, speed);
	softPwmWrite(0, 0);
	softPwmWrite(1, speed);
	delay(delay_time);
}

void backward(int speed, int delay_time) {
	printf(
			"\n##################################### Backward #####################################");
	softPwmWrite(2, speed);
	softPwmWrite(3, 0);
	softPwmWrite(0, speed);
	softPwmWrite(1, 0);
	delay(delay_time);
}

void left() {
	softPwmWrite(24, RANGE_MAX);
	softPwmWrite(25, 0);
	delay(50);
}

void right() {
	softPwmWrite(24, 0);
	softPwmWrite(25, RANGE_MAX);
	delay(50);
}

void stop() {
	printf(
			"\n##################################### Stop #####################################");
	softPwmWrite(3, 0);
	softPwmWrite(2, 0);
	softPwmWrite(0, 0);
	softPwmWrite(1, 0);
	softPwmWrite(24, 0);
	softPwmWrite(25, 0);
	delay(50);
}

void rightCorrect(int correctionAngle) {
	int delay_time;
	delay_time = correctionAngle * 25.55;
	printf(
			"\n##################################### Right #####################################");
	printf("\nRight to correct Angle of %d\n\n", correctionAngle);
	left();
	backward(400, delay_time);
	stop();
}

void leftCorrect(int correctionAngle) {
	int delay_time;
	delay_time = abs(correctionAngle * 25.55);
	correctionAngle = abs(correctionAngle);
	printf(
			"\n##################################### Left #####################################");
	printf("\nLeft to correct Angle of %d\n\n", correctionAngle);
	right();
	backward(400, delay_time);
	stop();
}

void sensorSetup() {
	printf("Distance Sensor Setup...");
	pinMode(GPIO_TRIG, OUTPUT);
	pinMode(GPIO_ECHO, INPUT);
	pinMode(GPIO_TRIG2, OUTPUT);
	pinMode(GPIO_ECHO2, INPUT);

	digitalWrite(GPIO_TRIG, LOW);
	digitalWrite(GPIO_TRIG2, LOW);
	delay(500);
}

double distanceSensor(int Pin_Trig, int Pin_Echo, int duration) {

	double distance;
	digitalWrite(Pin_Trig, HIGH);
	delayMicroseconds(10);
	digitalWrite(Pin_Trig, LOW);
	unsigned int echoStart = millis();
	while (digitalRead(Pin_Echo) == LOW && millis() - echoStart < 1000) {
		// do nothing
	}
	if (millis() - echoStart < 1000) {
		// Mark start
		unsigned int start = micros();
		while (digitalRead(Pin_Echo) == HIGH) {
			// do nothing
		}
		// Mark end
		unsigned int end = micros();
		unsigned int delta = end - start;

		distance = 34029 * delta / 2000000.0;
	}
	printf("distance: %f", distance);

	delay(duration);
	return distance;
}
