import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import io from 'socket.io-client';

let socket;

const Call = () => {
  const [room, setRoom] = useState("");
  const [urlParam] = useSearchParams();
  const ENDPOINT = 'http://localhost:5000';
  let localvid;
  let hisvid;
  let peerconnection;

  const servers = {
    iceServers: [
      {
        urls: ['stun1.l.google.com:19302' , 'stun2.l.google.com:19302']
      }
    ]
  }

  async function mediaset() {
    localvid = await navigator.mediaDevices.getUserMedia({ video: true  ,audio : true});
    document.getElementById('mine').srcObject = localvid;

    createoffer();
  }

  async function createpeerconnection(){
    peerconnection = new RTCPeerConnection(servers);

    hisvid = new MediaStream();
    document.getElementById('his').srcObject = hisvid;

    localvid.getTracks().forEach((track) => {
      peerconnection.addTrack(track, localvid);
    });

    peerconnection.ontrack = (e) => {
      e.streams[0].getTracks().forEach((track) => {
        hisvid.addTrack(track);
      })
    }

    peerconnection.onicecandidate = async (event) =>{
      if(event.candidate){
          console.log(event.candidate);
          socket.emit("info" ,  ({type:"candidate" , data : event.candidate , room: room}) ,(error) =>{
              if(error){
                  alert("infoemiterror");
              }
            })
      }
    }
  }

  async function createoffer() {
    await createpeerconnection();

    let offer = await peerconnection.createOffer();
    await peerconnection.setLocalDescription(offer);

    if(!localvid){
        localvid = await navigator.mediaDevices.getUserMedia({ video: true , audio: true});
        document.getElementById('mine').srcObject = localvid;
    }

    console.log('offer', offer);

    socket.emit("info" ,  ({type:"offer" , data : offer , room: room}) ,(error) =>{
      if(error){
          alert("infoemiterror");
      }
    })
  }

  async function createAnswer(offer){
      await createpeerconnection();

      await peerconnection.setRemoteDescription(offer)

      let answer = await peerconnection.createAnswer()
      await peerconnection.setLocalDescription(answer)

      socket.emit("info" ,  ({type:"answer" , data : answer , room: room}) ,(error) =>{
          if(error){
              alert("infoemiterror");
          }
        })
  }

  async function addAnswer(answer){
      if(!peerconnection.currentRemoteDescription){
          peerconnection.setRemoteDescription(answer);
      }
  }

  useEffect(() => {
    const troom = urlParam.get("room");

    socket = io(ENDPOINT);
    setRoom(troom);

    mediaset();

    socket.on("backinfo" , (data) =>{
        if(data.type === 'offer'){
            createAnswer(data.data);
            console.log('offer');
        }
        if(data.type === 'answer'){
            addAnswer(data.data);
            console.log('answer');
        }
        if(data.type === 'candidate'){
            if(peerconnection){
                 peerconnection.addIceCandidate(data.data);
                console.log('candidate');
            }
        }
    })

    return () => {
      socket.off();
    };
  }, [ENDPOINT, urlParam , room]);

  useEffect(() => {
    if (room) {
      socket.emit('join', ({ room: room }), (error) => {
        if (error) {
          alert(error);
        }
      });
    }
  }, [room]);


  return (
    <div>
      <video id="mine" autoPlay></video>
      <video id="his" autoPlay></video>
    </div>
  );
}

export default Call;
