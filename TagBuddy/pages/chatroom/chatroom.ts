import { Component, OnInit, ViewChild } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AngularFirestore } from "angularfire2/firestore";
import { User, Chat } from "../../app/app.models";
import { appconfig } from "../../app/app.config";
import { ChatService } from "../../app/app.service";
import { Storage } from "@ionic/storage";
import { HTTP } from '@ionic-native/http';

/**
 * Generated class for the ChatroomPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
interface Seens{
  seen: string;
  from : string;
}
@IonicPage()
@Component({
  selector: "page-chatroom",
  templateUrl: "chatroom.html"
})
export class ChatroomPage implements OnInit {
  setMsg: string
  seens :{[msg:string]: Seens;} ={}
  chats: any = [];
  chatpartner = this.chatService.currentChatPartner;
  chatuser;
  message: string;
  req : string;
  load :boolean
  jsonStr: string;
  responseStr: string;
  chatPayload: Chat;
  intervalScroll;
  @ViewChild("content") content: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db: AngularFirestore,
    private chatService: ChatService,
    private storage: Storage,
    private http: HTTP
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad ChatroomPage");
   
  }
  ionViewDidUnload() {
    this.content.scrollToBottom(300);  
  }
  //scrolls to bottom whenever the page has loaded
  ionViewDidEnter() {
     //300ms animation speed
     
     console.log("didenter")
     setTimeout(() => {
      this.content.scrollToBottom(300);
      console.log(this.chatuser.email)
     this.db.collection("users").doc(this.chatService.caesarShift(this.chatuser.email,5)).update({
      active: "true",
    }).catch(error => console.log(error));
   }, 1000);//may have to be increased if wifi is slow in rds

  }
  
  ionViewWillLeave() {
    console.log("willleave")
  }

 
    //set active to true
   
  
/*
  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom();
    });
  } */

  ngOnInit() {
    //get active status 
    this.storage.get("chatuser").then(chatuser => {
      this.chatuser = chatuser;
      this.db
      .collection<Chat>(appconfig.chats_endpoint, res => {
        return res.where("pair", "==", this.chatService.currentChatPairId);
      })
      .valueChanges()
      .subscribe(chats => {
        //this.availableusers = users;
        //console.log(chats);
        for(var i = 0; i<chats.length; i++){
        this.chats[i] = chats[i];
        this.chats[i].message = this.chatService.caesarShift(this.chats[i].message,-5)
        this.chats[i].sender = this.chatService.caesarShift(this.chats[i].sender,-5) 
        this.chats[i].pair = this.chatService.caesarShift(this.chats[i].pair,-5)
        
        if(this.chats[i].sender!=this.chatuser.email){
          console.log("got here")
          console.log(this.chats[i].sender)
          console.log(this.chatuser.email)

          this.seens[chats[i].message] = {seen:"true", from:this.chats[i].sender};
          this.db.collection("chats").doc(this.chats[i].time.toString()).update({
            seen: "true",
          }).then(()=>{
            this.content.scrollToBottom(300);
        }).catch(error => {console.log(error)});     
      }
      else{
        this.seens[this.chats[i].message] = {seen:this.chats[i].seen, from:this.chats[i].sender};
        }
      }
  });
  this.content.scrollToBottom(300);
    });
  
    
      console.log("done loading content")
      this.content.scrollToBottom(300);
  } //ngOnInit
  


  
  addChat() {
    if (this.message && this.message !== "") {
      console.log("Chatuser email")
      console.log(this.chatuser.email)
      this.chatPayload = {
        message: this.chatService.caesarShift(this.message,5),
        sender: this.chatService.caesarShift(this.chatuser.email,5),
        pair: this.chatService.currentChatPairId,
        seen: "false",
        time: new Date().getTime()
      };
      this.db.collection("chats").doc(this.chatPayload.time.toString()).set(this.chatPayload)
        .then(() => {
          //Clear message box
          this.message = "";

          //Scroll to bottom
          this.content.scrollToBottom(300);
        })
        .catch(err => {
          console.log(err);
        });

        if(this.chatpartner.friend === "Buddy"){
          console.log("BOT");
          let url = 'https://snatchbot.me/channels/api/api/id40400/appTagBuddy/apstag?user_id='+this.chatuser.email;
          let params = {
            "message": this.message,
          };
          let headers = {};
          console.log(params);
          this.http.setDataSerializer("json");
          this.http.setHeader("*", "Accept", "application/json");
          this.http.setHeader("*", "Content-Type", "application/json");
          this.http.post(url, params, headers)
          .then(data => {

            console.log(data.toString());
            let obj = JSON.parse(data.data);
            let strResponse = ""
            for(let i in obj.messages){
              strResponse = strResponse + obj.messages[i] + "\n";
            }
            this.chatPayload = {
              message: this.chatService.caesarShift(strResponse,5),
              sender: this.chatService.caesarShift("Buddy",5),
              pair: this.chatService.currentChatPairId,
              seen: "true",
              time: new Date().getTime()
            };
            this.db.collection("chats").doc(this.chatPayload.time.toString()).set(this.chatPayload)
              .then(() => {
                //Clear message box
                this.message = "";
      
                //Scroll to bottom
                this.content.scrollToBottom(300);
              })
              .catch(err => {
                console.log(err);
              });
          })
          .catch(error => {

            console.log(error.status);
            console.log(error.error); // error message as string
            console.log(error.headers);

          });
        
        }
    }
  } //addChat

  isChatPartner(senderEmail) {
    try{
      return !(senderEmail != this.chatuser.email);
  }
  catch(e){
    return;
  }
  } //isChatPartner

  scrollToBottom(){
    setTimeout(() => {
     this.content.scrollToBottom(200);
  }, 1000);
  }

  isLastMsgSeen(){
    try{
    if(this.seens[this.setMsg].from==this.chatuser.email){
      if(this.seens[this.setMsg].seen=="true"||this.chatpartner.email=="Buddy"){
        return "seen"
      }
      else if(this.seens[this.setMsg].seen=="false"){
        return "not seen"
      }
      else{
        return ""
      }
    }
  }
  catch(error){

  }
  }

  setLastMsg(msg){
    this.setMsg = msg;

  }
}
