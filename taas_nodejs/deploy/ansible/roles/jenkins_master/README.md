This ansible playbook currently applies to Ubuntu 16.04.
Ubuntu 14.04 is not supported, since it uses Upstart rather than systemd.


Manual installation in setting Jenkins master
=============================================
1. Add a credential for accesssing slaves
  Credentials -> Global credentials -> Add credentials:
    Kind: SSH Username with private key
    Scope: Global
    Username: ubuntu
    Private Key: Enter directly [private key]
    Description: TaaS CI access
    ID: taas-ci

2. Publish-over-SSH global settings
  Manage Jenkins -> Configure System -> Publish over SSH:
    Key: [private key]
    SSH Server:
      Name: Archive server
      Hostname: [archive server host IP]
      Username: ubuntu
      Remote Directory: /home/ubuntu/

3. Disable execution on master
  Manage Jenkins -> Configure System:
    # of executors: 0

4. Add generic slave nodes
  Manage Jenkins -> Configure System -> Manage Nodes -> New Node:
    Node name: generic-[#]
    # of executors: 2
    Remote root directory: /home/ubuntu/jenkins
    Labels: generic build deploy
    Usage: Utilize this node as much as possible
    Launch method: Launch slave agents on Unix machines via SSH
      Host: [slave host IP]
      Credentials: ubuntu (TaaS CI access)
      Availability: Keep this slave on-line as much as possible

5. Add selenium slave nodes
  Manage Jenkins -> Configure System -> Manage Nodes -> New Node:
    Node name: selenium-[#]
    # of executors: 1
    Remote root directory: /home/ubuntu/jenkins
    Labels: selenium
    Usage: Only build jobs with label restrictions matching this node
    Launch method: Launch slave agents on Unix machines via SSH
      Host: [slave host IP]
      Credentials: ubuntu (TaaS CI access)

