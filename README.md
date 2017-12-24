## Smart Guided Robot


### System Diagram
![](https://i.imgur.com/3rzwl8Q.png)

### Getting Started
---
#### Web
1. Install Nodejs Server
```
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm
```
2. Build the Nodejs Server
```
cd Project_robot/Web/Server
npm install
node bin/www
```
3. Open Browser
using the below URL will see this project web 
```
http://localhost:3000/static/lead_page.html
```
```
http://localhost:3000/index.html
```
---
#### Android
1. Open BluetoothNew Project
2. Change the Webview URL to http://localhost:3000/static/lead_page.html
3. Run the App
---
#### Car
1. Install Ubuntu 16.04 OS to Pi3 (or other OS)
2. Compile RaspberryPi3/control.cpp
3. Reference to [Pi3 docs](https://github.com/ekeroc/Project_robot/tree/master/RaspberryPi3/docs)
* [Os Install](https://github.com/ekeroc/Project_robot/blob/master/RaspberryPi3/docs/Raspberry-Pi-Environment-Setup-v1.1.docx)
* [Pi3 GPIO control docs](https://github.com/ekeroc/Project_robot/blob/master/RaspberryPi3/docs/Raspberry%20Pi%203%20Setup%20for%20GPIO.docx)
* [Car wiring diagram](https://github.com/ekeroc/Project_robot/blob/master/RaspberryPi3/docs/%E7%B7%9A%E8%B7%AF%E5%9C%96.png)
---
### Reference
Graduation project paper