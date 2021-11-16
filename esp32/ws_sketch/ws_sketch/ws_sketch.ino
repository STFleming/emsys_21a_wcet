#include <ArduinoWebsockets.h>
#include <WiFi.h>

#define SIZE 125

const char* ssid = "stf_0x2a"; 
const char* password = "stop trying to steal my wifi password... ffs"; 

using namespace websockets;

void onMessageCallback(WebsocketsMessage message) {
    Serial.print("Got Message: ");
    Serial.println(message.data());
}

void onEventsCallback(WebsocketsEvent event, String data) {
    if(event == WebsocketsEvent::ConnectionOpened) {
        Serial.println("Connnection Opened");
    } else if(event == WebsocketsEvent::ConnectionClosed) {
        Serial.println("Connnection Closed");
    } else if(event == WebsocketsEvent::GotPing) {
        Serial.println("Got a Ping!");
    } else if(event == WebsocketsEvent::GotPong) {
        Serial.println("Got a Pong!");
    }
}

volatile float rvec [SIZE];
volatile float rmat [SIZE][SIZE];
float res  [SIZE];

WebsocketsClient client;
void setup() {
    Serial.begin(115200);
    // Connect to wifi
    WiFi.begin(ssid, password);

    // Wait some time to connect to wifi
    for(int i = 0; i < 10 && WiFi.status() != WL_CONNECTED; i++) {
        Serial.print(".");
        delay(1000);
    }

    Serial.print("\nConnected to Wifi sucessfully\n");

    // run callback when messages are received
    client.onMessage(onMessageCallback);
    
    // run callback when events are occuring
    client.onEvent(onEventsCallback);

    // Connect to server
    client.connect("ws://192.168.0.102:1234");

    // Send a message
    //client.send("Hello Server");

    // Send a ping
    client.ping();

    // initialise random vector and matricies
    for(int i=0; i<SIZE; i++) {
      rvec[i] = (float)random(1000);
    }

    for(int i=0; i<SIZE; i++) {
      for(int j=0; j<SIZE; j++) {
        rmat[i][j] = (float)random(1000);
      }
    
    }
    
}

void compute(){
  for(int i=0; i<SIZE; i++) {
    res[i] = 0.0;
    for(int j=0; j<SIZE; j++) {
      res[i] += rvec[j] * rmat[i][j];    
    }
  }
}

unsigned long t0;
unsigned long t1;

String json_str;

void loop() {
    client.poll();
    t0 = micros();
    compute();
    t1 = micros();

    unsigned long usec = (t1 - t0);

    json_str = "{ \"id\" : \"ESP32\", \"val\":" + String(usec) + "}";
    delayMicroseconds(500);

    client.send(json_str);
}
