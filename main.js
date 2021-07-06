let Peer = require('simple-peer')   // importing simple peer package
console.log(filter)
const videoGrid = document.getElementById('video-grid')   
const videoGrid2 = document.getElementById('video-grid2')

let socket = io('/')                         //initialising socket
var video = document.querySelector('video') //reference to our own video
const inviteButton = document.querySelector("#inviteButton"); 

let client = {}  //define the client

navigator.mediaDevices.getUserMedia({ video: true, audio: true })  //getting user's stream through the browser
    .then(stream => {                       //if user gives the permission, proceed
        socket.emit('NewClient')            //message in the backend about the new client
        video.srcObject = stream           //display our own video
        video.play()
        mystream = stream;

        function InitPeer(type) {         //initialise a new peer
            let peer = new Peer({ initiator: (type == 'init') ? true : false, stream: stream, trickle: false }) //if type is true, send the offer to stream
            peer.on('stream', function (stream) {        
                CreateVideo(stream)                                       //create a new video when we get stream from other user
                const video2=document.getElementById("peerVideo")         //reference to the other person's video
                videoGrid2.append(video2)
                
            })

            peer.on('data', function (data) {
              let decodedData = new TextDecoder('utf-8').decode(data)
             const video3=document.getElementById('peerVideo')
              video3.style.filter = decodedData
          })
          return peer
      

        peer.on('close', function () {                              //destroy the video when peer is closed
                document.getElementById("peerVideo").remove();   
                peer.destroy()
             })
            return peer
        }
        function MakePeer() {                                     //for peer of type init                                                                      
            client.gotAnswer = false                              
            let peer = InitPeer('init')
            peer.on('signal', function (data) {                   
                if (!client.gotAnswer) {
                    socket.emit('Offer', data)
                }
            })
            client.peer = peer
        }

        function FrontAnswer(offer) {                           //for peer of type not init
            let peer = InitPeer('notInit')
            peer.on('signal', (data) => {
                socket.emit('Answer', data)
            })
            peer.signal(offer)
            client.peer = peer
        }

        function SignalAnswer(answer) {                    
            client.gotAnswer = true
            let peer = client.peer
            peer.signal(answer)
        }
        function CreateVideo(stream) {                        //create and append the video             
      
            let video = document.createElement('video')
            video.id = 'peerVideo'
            video.srcObject = stream
            video.setAttribute('class', 'embed-responsive-item')
            document.querySelector('#peerDiv').appendChild(video)
               
            video.play()
            //wait for 1 sec
       
            setTimeout(() => SendFilter(filter), 1000)

            video.addEventListener('click', () => {
                if (video.volume != 0)
                    video.volume = 0
                else
                    video.volume = 1
            })

        }
        function SessionActive() {                      //someone else opens the url when two people are already in a call
            document.write('Session Active with 2 users. Please come back later!')
        }
     
        socket.on('BackOffer', FrontAnswer)
        socket.on('BackAnswer', SignalAnswer)
        socket.on('SessionActive', SessionActive)
        socket.on('CreatePeer', MakePeer)
        
     videoGrid.append(video);
  })

    function show(){                               //runs when invite button is clicked
      prompt(
        "Copy this link and send it to someone you want to video call with :)",
        window.location.href
      );
    };
 
    function info(){                            //runs when about button is clicked
      alert(
        "Hey there! This is a video conferencing platform designed to facilitate video call between two users. It allows you to: \n\u2022Mute/Unmute your audio\n\u2022Show/Stop your video\n\u2022Invite Someone"
      );
    };
   
    function filt(){                          //adds filter as per selection

      var video = document.querySelector('video')
      const filter = document.getElementById("filters")
     
      let cFilter = filter.value

      video.style.filter = cFilter
  
  }
  
    function setMuteButton(){                  
        const html = `
          <i class="fas fa-microphone"></i>
          <span>Mute</span>
        `
        document.querySelector('.main__mute_button').innerHTML = html;
      }
      
      function setUnmuteButton(){
        const html = `
          <i class="unmute fas fa-microphone-slash"></i>
          <span>Unmute</span>
        `
        document.querySelector('.main__mute_button').innerHTML = html;
      }
      
      function setStopVideo(){                    
        const html = `
          <i class="fas fa-video"></i>
          <span>Stop Video</span>
        `
        document.querySelector('.main__video_button').innerHTML = html;
      }
      
      function setPlayVideo(){
        const html = `
        <i class="stop fas fa-video-slash"></i>
          <span>Play Video</span>
        `
        document.querySelector('.main__video_button').innerHTML = html;
      }
    
function muteUnmute(){                                             //mute and unmute functions when mute button is clicked                               
        
        const enabled = mystream.getAudioTracks()[0].enabled;
        if (enabled) {
          mystream.getAudioTracks()[0].enabled = false;
          setUnmuteButton();
        } else {
          setMuteButton();
          mystream.getAudioTracks()[0].enabled = true;
        }
      }
    
      
    function playStop(){                                     //show and stop video functions when video button is clicked
        console.log('object')
        let enabled = mystream.getVideoTracks()[0].enabled;
        if (enabled) {
          mystream.getVideoTracks()[0].enabled = false;
          setPlayVideo()
        } else {
          setStopVideo()
          mystream.getVideoTracks()[0].enabled = true;
        }
      }
 
