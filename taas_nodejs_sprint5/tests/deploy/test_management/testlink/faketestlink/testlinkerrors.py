class Error(Exception):
    """Base class for exceptions in this module."""
    pass
class TLConnectionError(Error):
	def __str__(self):
		return 'fake TLConnectionError'
class TLResponseError(Error):
	def __str__(self):
		return 'fake TLResponseError'
class TLArgError(Error):
	def __str__(self):
		return 'fake TLArgError'
class TLAPIError(Error):
	def __str__(self):
		return 'fake TLAPIError'