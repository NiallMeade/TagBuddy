export interface User {
  email: string;
  name: string;
  password: string;
  active: string;
  gender: string;
  time: number;
}

export interface Chat {
  message: string;
  pair: string;
  sender: string;
  seen: string;
  time: number;
}

export interface Friend {

 friender: string;
  friend:string; 
  pairId: string;
}
export interface Group {

}