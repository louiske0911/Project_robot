import jenkins.model.*
import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.common.*
import com.cloudbees.plugins.credentials.domains.*
import com.cloudbees.plugins.credentials.impl.*
import com.cloudbees.jenkins.plugins.sshcredentials.impl.*
import hudson.plugins.sshslaves.*;

def domain = Domain.global()
def store = Jenkins.instance.getExtensionList('com.cloudbees.plugins.credentials.SystemCredentialsProvider')[0].getStore()


def makeSSHPrivateKeyCredential = {credentialId, username, privateKey ->
	def passphrase = ""
	def description = "Created by TaaS"

	def priveteKey = new BasicSSHUserPrivateKey(
			CredentialsScope.GLOBAL,
			credentialId,
			username,
			new BasicSSHUserPrivateKey.DirectEntryPrivateKeySource(privateKey),
			passphrase,
			description
			)

	return priveteKey
}


def makeUsernamePasswordCredential = {credentialId, username, password ->
	def passphrase = ""
	def description = "Created by TaaS"

	def usernamePassword = new UsernamePasswordCredentialsImpl(
			CredentialsScope.GLOBAL,
			credentialId,
			description,
			username,
			password
			)

	return usernamePassword
}


def lookupCredentialById = {credentialId ->
	def creds = com.cloudbees.plugins.credentials.CredentialsProvider.lookupCredentials(
			com.cloudbees.plugins.credentials.common.StandardCredentials.class,
			Jenkins.instance,
			null,
			null
			)

	def c = creds.findResult{it.id == credentialId ? it: null}
	return c
}


def deleteCredential = {credentials ->
	if (credentials) {
		store.removeCredentials(domain, credentials)
	}
}


def smartUpdateCredential = {credentialId, newCredentials ->
	def oldCredentials = lookupCredentialById(credentialId)

	if (!newCredentials) {
		println("delete credentials" )
			deleteCredential(oldCredentials)
	}
	else if (!oldCredentials) {
		println("add credentials")
			store.addCredentials(domain, newCredentials);
	}
	else {
		println("update credentials")
			store.updateCredentials(domain, oldCredentials, newCredentials)
	}
}

