######################################################################################################################
############################Source code for the RPi controller of Sorting Assistaint##################################
##########################################By Ateuco and Component17 teams#############################################
###################################################version.0.4########################################################
####################################################02.08.2019########################################################
######################################################################################################################


import datetime
from itertools import filterfalse
import serial
import time
import threading
import socketio
import ast
import sys
import os
import argparse
import json
import subprocess
#import lcd_screen
class state:                            #Serial state control
    def __init__ (self, status, port):
        self.status = status
        self.port = port
    def getState(self):
        return self.status
    def setState(self, state):
        self.status = state
def createParser ():                    #Parsing arguments
    parser = argparse.ArgumentParser()
    parser.add_argument ("--port", default=1, required=True)
    return parser


class ctrlStatus:
    def __init__(self, flag, data, dataFlag):
        self.flag = flag
        self.data = data
        self.dataFlag = dataFlag

class reportCallback():
    def __init__(self, reportArray):
        self.reportArray = reportArray


class reportData():
    def __init__(self, dataPacket):
        self.dataPacket = dataPacket



servStatus = ctrlStatus(False,list(),int())

GET_IP_CMD ="hostname -I"                   #Recieving IPv4
def run_cmd(cmd):
    return subprocess.check_output(cmd, shell=True).decode('utf-8')
ip = run_cmd(GET_IP_CMD)
print(ip[:12])
#lcd_screen.show_ip(ip[:12])                #Printing on lcd

f = open('logs.txt', 'w')

repData = reportData("")
report = reportCallback("")
parser = createParser()
namespace = parser.parse_args(sys.argv[1:])
socketPort = int(namespace.port)
print (socketPort)

sio = socketio.Client()                     #Connecting to socket server
@sio.on('connect')
def on_connect():
    print('connection established')

@sio.on('switch')                           #Json listener
def on_turn_led(data):
    if data != None:
        attempts = 0
        servStatus.flag = True
        dataFlag = False
        print("new task started")
        array = data
        report.reportArray = list()
        taskList = list()
        expectedRespond = list()
        for val in array:
            if val["color"]["r"] == 0 and val["color"]["g"]==0 and val["color"]["b"] ==0:       #If incoming colour data = "000"

                sendingData = '%s000 '%val["id"]
                sending(sendingData)
            else:
                zerosNumR = 3-len(str(val["color"]["r"]))
                val["color"]["r"] = '0'*zerosNumR + str(val["color"]["r"])
                zerosNumG = 3-len(str(val["color"]["g"]))
                val["color"]["g"] = '0'*zerosNumG + str(val["color"]["g"])
                zerosNumB = 3-len(str(val["color"]["b"]))
                val["color"]["b"] = '0'*zerosNumB + str(val["color"]["b"])
                sendingData = "%s004%s%s%s "%(val["id"],val["color"]["r"],val["color"]["g"],val["color"]["b"])

                sending(sendingData)
            taskList.append(sendingData)
            expectedRespond.append(sendingData[:12])


            time.sleep(0.002)

        #f.write(str(taskList) + "task list recieved via socket at " + str(datetime.datetime.now())+ "\n")
        def firstAttempt(x):
            if act == x[:12]:
                return 0
            else:
                return 1


        for act in report.reportArray:                  #Checking if LEDs recieved commands at first attempt
            firstDelivList = filter(firstAttempt,taskList)
            taskList = list(firstDelivList)


        if [expectedRespond, False] in servStatus.data:
            print ("data same")
            index = servStatus.data.index([expectedRespond, False])
            servStatus.data[index][1]=True
        else:
            print("data changed")
            #servStatus.data[i][1]=False



        def deliveryCtrl(x):
            if x[:12] in report.reportArray:

                sio.emit("switch:status",taskList)
                return 0
            else:
                sending(x)
                time.sleep(0.002)
                return 1



        servStatus.data.append([expectedRespond, dataFlag])



        while attempts <300:

            truncDelivList = filter(deliveryCtrl,taskList)

            taskList = list(truncDelivList)
            if len(taskList) == 0:
                print ("_____________All packets delivered____________")
                break
            if [expectedRespond, True] in servStatus.data:
                print ("__________________BREAK HERE__________________")
                break

            attempts +=1
            #print (attempts)


        if [expectedRespond, True] in servStatus.data:
            servStatus.data.remove([expectedRespond, True])
        elif [expectedRespond, False] in servStatus.data:
            servStatus.data.remove([expectedRespond, False])
        print(servStatus.data , " data ")


        time.sleep(0.02)
        sio.emit("switch:status",report.reportArray)        #Sending LED status to socket
        print (report.reportArray)
        #f.write(str(report.reportArray) + "recieved reports at " + str(datetime.datetime.now())+ "\n")
        print("\n")



stream = state(0, serial.Serial('/dev/serial0',115200, timeout =1))     #Initializing serial connection
stream.port.close()

def recieve():                          #LED callback listener
    stream.port.open()
    while True:

        if stream.getState() == 0:

            data = stream.port.readline()

            if len(data) !=0:
                try:
                    data= data.decode('utf-8').replace("\n", "")
                except UnicodeDecodeError:
                    print ("WrongData")
                if data[12:15] == "005":
                    print ("sensor", data)
                    sio.emit("sensor:detect",data[:12])
                else:
                    if data[:12] not in report.reportArray:
                        report.reportArray.append(data[:12])
        elif stream.getState() == 1:
            pass


def sending(sendingData):               #Sending commands to LEDs
    recvData = sendingData.encode('utf-8')
    stream.port.write(recvData)



@sio.on('disconnect')                   #Disconnecting from socket server
def on_disconnect():
    print('disconnected from server')

sio.connect('http://localhost:{}'.format (socketPort))
recieve()
sio.wait()
f.close()