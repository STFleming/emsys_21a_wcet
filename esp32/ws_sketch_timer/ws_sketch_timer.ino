#include <ArduinoWebsockets.h>
#include <WiFi.h>

#define SIZE 125

const char* ssid = "stf_0x2a"; 
const char* password = "jyrs3CkNqtqy"; 

using namespace websockets;

// Initialise one of the counters
void initTimer0() {

  uint32_t* alarm1 = (uint32_t *)((void *)0x3FF5F010);    
  uint32_t* alarm2 = (uint32_t *)((void *)0x3FF5F014);
  *alarm1 = 0xFFFFFFFF;
  *alarm2 = 0xFFFFFFFF;
  
  uint32_t *config = (uint32_t *)((void *)0x3FF5F000);
  uint32_t d = 0;
  *config = d; // clear the config
  d |= (0x1 << 31);
  d |= (0x1 << 30);
  d |= (0x1 << 13); // divide by 80 gives us a usec timer
  //d |= (0x1 << 12);
  //d |= (0x1 << 11);
  //d |= (0x1 << 10);
  *config = d;

  return;
}


// Reads the timer value
uint64_t readTimer0(){
  // Pause the timer
  uint32_t *config = (uint32_t *)((void *)0x3FF5F000);
  uint32_t d = 0;
  *config = d; // clear the config
  d |= (0x1 << 31);
  d |= (0x1 << 30);
  d |= (0x1 << 13);
  
  // Trigger the timer to copy the value to the register
  uint32_t *timertrig = (uint32_t *)((void*)0x3FF5F00C);
  *timertrig = 1;
  
  uint32_t *lowerbits = (uint32_t *)((void *)0x3FF5F004);
  uint32_t *upperbits = (uint32_t *)((void *)0x3FF5F008);
  uint64_t ut = *upperbits;
  uint64_t t = (ut << 32) | *lowerbits;
  
  // Start the timer again
  *config = d;
  
  return t;
}

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

    initTimer0();
    
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

uint64_t tt0;
uint64_t tt1;

String json_str;

void loop() {
    client.poll();
    tt0 = readTimer0();
    compute();
    tt1 = readTimer0();
    uint64_t tt_time = (tt1 - tt0);

    json_str = "{ \"id\" : \"ESP32\", \"val\":" + String((uint32_t)tt_time) + "}";
    delayMicroseconds(500);

    client.send(json_str);
}
