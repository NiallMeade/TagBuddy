import { Component, OnInit } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AngularFirestore } from "angularfire2/firestore";
import { Storage } from "@ionic/storage";
import { appconfig } from "../../app/app.config";
import { User, Friend, Chat} from "../../app/app.models";

import { ChatService } from "../../app/app.service";
import { ChatroomPage } from "../chatroom/chatroom";
import { FriendsaddPage } from "../friendsadd/friendsadd"
interface Person {
  gender: string;
  active: string;
  message: string;
}

@IonicPage()
@Component({
  selector: "page-chats",
  templateUrl: "chats.html"
})
export class ChatsPage implements OnInit {
  
  availableusers: any = [];
  persons : { [id: string] : Person; } ={}
  chatuser;
  tempName: string;
  pairId: string;
  doneLeave: boolean = false;
  doneEnter: boolean = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db: AngularFirestore,
    private storage: Storage,
    private chatservice: ChatService
  ) {}

  ngOnInit() {
    //Fetch other users //and active status //and icon for friends

    this.storage.get("chatuser").then(chatuser => {
      this.chatuser = chatuser;
   this.storage.get("pairId").then(pairId =>{
      this.pairId = pairId;

    })  

    this.tempName=this.chatservice.caesarShift(this.chatuser.name, 5);
      this.db
      .collection<Friend>(appconfig.friends_endpoint, res => {
        return res.where("friender", "==",this.tempName);
      })
      .valueChanges()
      .subscribe(friends => {
          this.availableusers = friends.filter(friend => {
            if (friend.friender == this.tempName) {
              friend.friend = this.chatservice.caesarShift(friend.friend, -5);
              return friend
            }
          });
          console.log(this.availableusers)
         for(let i in this.availableusers){
          this.db
        .collection<User>(appconfig.users_endpoint, res => {
          return res.where("name", "==",this.chatservice.caesarShift(this.availableusers[i].friend, 5));
        })
        .valueChanges()
        .subscribe(users => {
          
            this.db
            .collection<Chat>(appconfig.chats_endpoint, res => {
            return res.where("pair", "==",this.chatservice.caesarShift(this.availableusers[i].pairId, 5));
          })
        .valueChanges().subscribe(chats => {
        try{
          let msg = "No messages yet"
          if(chats.length!=0){
            msg = this.chatservice.caesarShift(chats[chats.length-1].message, -5);
          }
          console.log(msg)
           this.persons[this.availableusers[i].friend] = {gender:users[0].gender, active:users[0].active, message:msg}
          }
          catch(error){
            //do nothing
          }
          });
        
        });
      }
      });
      console.log(this.persons)
    });


    
  }

  ionViewDidLeave() {
    //set active to false
  console.log("Not active")
    this.db.collection("users").doc(this.chatservice.caesarShift(this.chatuser.email,5)).update({
      active: "false",
    }) .catch(error => console.log(error));

  
  }

  
  ionViewDidEnter() {
    // console.log("Enetred Page")
    // //set active to true

    this.db.collection("users").doc(this.chatservice.caesarShift(this.chatuser.email,5)).update({
      active: "true",
    }).catch(error => console.log(error));
  }

  goToChat(chatpartner) {

    this.pairId = chatpartner.pairId;
    console.log(this.pairId);

    this.chatservice.currentChatPairId =  this.pairId;

    this.chatservice.currentChatPartner = chatpartner;

    this.navCtrl.push(ChatroomPage);

  } //goToChat
  addFriend(){
    this.navCtrl.push(FriendsaddPage);
  }



  getImg(userName){
    if(userName==="Buddy"){
      return "assets/imgs/buddy.png"
    }
    else{
      try{
    return "assets/imgs/"+this.persons[userName].gender+".png"
      }
      catch(error){
        return "assets/imgs/male.png"
      }
    }
  }

  getActiveStatus(userName){
    if(userName==="Buddy"){
    return "assets/imgs/active.png"
  }
  else{
    try{
      
    if(this.persons[userName].active==="true"){
      return "assets/imgs/active.png"
    }
    else{
      return "assets/imgs/notActive.png"
    }
  }catch(error){
    return "active"
  }
}
}

getMostRecentMsg(userName){
  if(userName==="Buddy"){
    return "Hi, I'm Buddy 👋 😎🤖, Please tell me your name so we can be friends!! 🤩"
  }
  else{
  try{
  return this.persons[userName].message;
  }
  catch(error){
    return ""
  }
}
}
  
}
