import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";
import { User, Chat } from "./app.models";
import { appconfig } from "./app.config";

@Injectable()
export class ChatService {
  users: AngularFirestoreCollection<User>;

  chats: AngularFirestoreCollection<Chat>;

  //The pair string for the two users currently chatting
  currentChatPairId;
  currentChatPartner;

  constructor(private db: AngularFirestore) {
    
    this.users = db.collection<User>(appconfig.users_endpoint);
    this.chats = db.collection<Chat>(appconfig.chats_endpoint);
  }

  addUser(payload) {
    return this.users.add(payload);
  } //addUser

  addChat(chat: Chat) {
    return this.chats.add(chat);
  } //addChat

  // createPairId(user1, user2) {
  //   let pairId;
  //   if (user1.friendtime < user2.friendtime) {
  //     pairId = `${user1.friend}|${user1.friender}`;
  //   } else {
  //     pairId = `${user1.friender}|${user1.friend}`;
  //   }
  //   console.log
  //   return pairId;
  // } //createPairString

}
