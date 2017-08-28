var JenkinsJob = require('./job.js');
exports.GIT_DESCRIPTOR = [
    {
        name: 'repoURL',
        displayName: 'Repository URL',
        displayHint: 'Git repository URL',
        type: JenkinsJob.DESCRIPTOR_TYPE.URL,
        alreadyExists: true,
        required: true
    },
    {
        name: 'repoBranch',
        displayName: 'Repository branch',
        displayHint: 'Git repository branch',
        type: JenkinsJob.DESCRIPTOR_TYPE.STRING,
        defaultValue: '*/master'
    },
    {
        name: 'username',
        displayName: 'Username',
        displayHint: 'Git repository username. This is only needed if authentication is required.',
        type: JenkinsJob.DESCRIPTOR_TYPE.STRING,
    },
    {
        name: 'password',
        displayName: 'Password',
        displayHint: 'Git repository password. This is only needed if password-based authentication is required.',
        type: JenkinsJob.DESCRIPTOR_TYPE.PASSWORD,
    },
    {
        name: 'privateKey',
        displayName: 'Private key',
        displayHint: 'Git repository private key. This is only needed if key-based authentication is required.',
        type: JenkinsJob.DESCRIPTOR_TYPE.STRING,
        longText: true
    },
];

exports.BUILD_DESCRIPTOR = [
    {
        name: 'buildScript',
        displayName: 'Build script',
        displayHint: 'Build script path',
        type: JenkinsJob.DESCRIPTOR_TYPE.PATH
    }
];

exports.DEPLOY_DESCRIPTOR = [
    {
        name: 'deployCfg',
        displayName: 'Deploy config',
        displayHint: 'Deployment configuration file path',
        type: JenkinsJob.DESCRIPTOR_TYPE.PATH
    }
];