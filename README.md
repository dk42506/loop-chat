I want this project to be a live chat room between 2 parties. 

Features
    - 1 on 1 conversations 
    - can search for other useres by username 
    - can create groups


Smaller features
    - can create profile bio / profile picture 
    - can switch between light and dark mode 


Need to learn 
    - Typescript (shouldnt be hard)
    - Tailwind 
    - Firebase live data storage 



Firebase configureation 

chats
  |- chat1
  |    |- participants:
  |    |    |- user1: true
  |    |    |- user2: true
  |    |- messages
  |         |- message1
  |         |    |- text: "Hello, how are you?"
  |         |    |- senderId: "user1"
  |         |    |- timestamp: 1632148734000
  |         |
  |         |- message2
  |              |- text: "I'm good, thanks!"
  |              |- senderId: "user2"
  |              |- timestamp: 1632148762000
  |
  |- chat2
       |- participants:
       |    |- user1: true
       |    |- user3: true
       |- messages
            |- message3
            |    |- text: "Hi there!"
            |    |- senderId: "user1"
            |    |- timestamp: 1632148801000
            |
            |- message4
                 |- text: "Hello!"
                 |- senderId: "user3"
                 |- timestamp: 1632148814000


/users
  /user1
    name: "John Doe"
    username: "john_doe"
    // Other user information
  /user2
    name: "Alice Smith"
    username: "alice_smith"
    // Other user information
  // ...
