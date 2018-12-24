import { Component, OnInit } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AngularFirestore } from "angularfire2/firestore";
import { Storage } from "@ionic/storage";
import { appconfig } from "../../app/app.config";
import { User } from "../../app/app.models";

import { ChatService } from "../../app/app.service";
import { ChatroomPage } from "../chatroom/chatroom";
import { FriendsaddPage } from "../friendsadd/friendsadd"


@IonicPage()
@Component({
  selector: "page-chats",
  templateUrl: "chats.html"
})
export class ChatsPage implements OnInit {
  availableusers: any = [];
  chatuser;
  pairId: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db: AngularFirestore,
    private storage: Storage,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    //Fetch other users

    this.storage.get("chatuser").then(chatuser => {
      this.chatuser = chatuser;
    this.storage.get("pairId").then(pairId =>{
      this.pairId = pairId;

    })  
      this.db
        .collection<User>(appconfig.users_endpoint)
        .valueChanges()
        .subscribe(users => {
          //this.availableusers = users;
          console.log(users);
          this.availableusers = users.filter(user => {
            if (user.friender == chatuser.email) {
              // this.chatService.currentChatPairId = user.pairId;
              // console.log(this.pairId)
              return user;
            }
          });
        });
    });
  }

  goToChat(chatpartner) {

    this.pairId = chatpartner.pairId;
    console.log(this.pairId);

    this.chatService.currentChatPairId =  chatpartner.pairId;

    this.chatService.currentChatPartner = chatpartner;

    this.navCtrl.push(ChatroomPage);


  } //goToChat
  addFriend(){
    this.navCtrl.push(FriendsaddPage);
  }
}
