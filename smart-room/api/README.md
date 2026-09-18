# ESP32 Integration for Smart Room & Locker System

## 1. Overview
The ESP32 microcontroller serves as the bridge between the physical world (RFID scanners, Servo motors for lockers, LED indicators) and the Firebase Cloud Firestore database. We use the **Firebase REST API** (via HTTPS requests) since it is lightweight and well-suited for microcontrollers, avoiding heavy SDK dependencies.

## 2. Authentication
To securely access Firestore via REST, the ESP32 must authenticate. 
1. Create a dedicated "System User" in Firebase Authentication (e.g., `esp32@smartroom.local`).
2. ESP32 sends an HTTP POST to the Firebase Auth endpoint with email/password.
3. ESP32 receives an `idToken`, which is attached to all subsequent Firestore REST requests.

**Auth Endpoint:**
`POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_WEB_API_KEY`

## 3. Firestore REST Endpoints

*Base URL: `https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents`*

### Get Rooms
- **URL:** `/rooms`
- **Method:** GET
- **Headers:** `Authorization: Bearer <idToken>`

### Get Locker Status
- **URL:** `/lockers/locker_1`
- **Method:** GET
- **Headers:** `Authorization: Bearer <idToken>`
- **Response:** JSON containing locker fields (e.g., `status: "locked"`).

### Open Locker (Update Key Transaction)
- **URL:** `/keyTransactions?documentId=<new_id>` (Create) or Patch existing.
- **Method:** POST or PATCH
- **Headers:** `Authorization: Bearer <idToken>`, `Content-Type: application/json`
- **Body:** JSON payload with `status: "borrowed"`, `timestamp`, `userId`, `roomId`.

## 4. Arduino/ESP32 Code Example

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASS";
const String apiKey = "YOUR_FIREBASE_API_KEY";
const String projectId = "YOUR_PROJECT_ID";
String idToken = "";

Servo lockerServo;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
  
  lockerServo.attach(18); // Servo on pin 18
  lockerServo.write(0);   // Locked position
  
  authenticate();
}

void authenticate() {
  HTTPClient http;
  String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + apiKey;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"email\":\"esp32@smartroom.local\",\"password\":\"esp32pass\",\"returnSecureToken\":true}";
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    idToken = doc["idToken"].as<String>();
  }
  http.end();
}

void openLocker() {
  lockerServo.write(90); // Open position
  delay(5000);           // Keep open for 5 seconds
  lockerServo.write(0);  // Lock again
}

// Pseudo-loop for RFID scanning
void loop() {
  // if (rfid.scanned()) {
  //   String uid = rfid.getUID();
  //   bool isValid = validateBookingViaAPI(uid);
  //   if(isValid) { openLocker(); }
  // }
}
```

## 5. Flowchart
```
[Boot ESP32]
     |
     v
[Connect WiFi]
     |
     v
[Authenticate Firebase Auth] -> (Get idToken)
     |
     v
[Wait for RFID Scan] <----------------+
     |                                |
     v                                |
[Read RFID Tag UID]                   |
     |                                |
     v                                |
[HTTP GET Bookings where User=UID]    |
     |                                |
     v                                |
[Parse JSON & Validate Time]          |
     |                                |
   /   \                              |
 Yes    No ---------------------------+
  |                                   |
  v                                   |
[Open Servo (Locker)]                 |
  |                                   |
  v                                   |
[HTTP POST KeyTransaction=borrowed]   |
  |                                   |
  +-----------------------------------+
```

## 6. Wiring Diagram
- **ESP32 3V3** -> RFID MFRC522 (3.3V)
- **ESP32 GND** -> RFID GND, Servo GND, LEDs GND
- **ESP32 D18** -> Servo Signal (PWM)
- **ESP32 D5, D19, D23, D14 (SPI)** -> RFID MFRC522 (SCK, MISO, MOSI, SDA)

## 7. Required Libraries
Install via Arduino IDE Library Manager:
- `ArduinoJson` by Benoit Blanchon
- `ESP32Servo` by Kevin Harrington
- `MFRC522` by GithubCommunity
