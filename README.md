# **Howudoin App Frontend**

## **Overview**
This is the frontend part of the CS310 Mobile Application Development course project for learning purposes. The frontend of the Howudion App is a React Native application designed for sending and receiving messages between users. It communicates with a backend API to fetch messages and send new ones. The app includes features like timestamped messages and user-friendly UI. It uses local MongoDB database.

---

## **Features**
- View messages exchanged with a friend.
- Send new messages.
- Display timestamps for each message.
- Intuitive and visually appealing UI.
- Handles loading states and errors gracefully.

---

## **Technologies Used**
- React Native
- AsyncStorage for local storage of user credentials
- Fetch API for HTTP requests

---

## **Setup Instructions**
1. **Clone the Repository**:
   ```bash
   git clone <repository_url>
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm start
   ```
   Use an emulator or physical device to run the app.

4. **Environment Configuration**:
   Update the API URL in the code (`http://10.0.2.2:8080`) if your backend is hosted elsewhere.

---

## **How to Use**
1. Log in to the app (Assumes authentication is already set up) or Sign up.
2. Send/accept friend requests.
3. Select a friend to view messages.
4. Type and send new messages.
5. View timestamps for each message.
6. Create groups and send messages.

---
