let Peer = require('simple-peer')
const videoGrid = document.getElementById('video-grid')
const videoGrid2 = document.getElementById('video-grid2')

let socket = io('/')
var video = document.querySelector('video')
let client = {}

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        socket.emit('NewClient')
        video.srcObject = stream
        
        video.play()
        mystream = stream;

        function InitPeer(type) {
            let peer = new Peer({ initiator: (type == 'init') ? true : false, stream: stream, trickle: false })
            peer.on('stream', function (stream) {
                CreateVideo(stream)
                const video2=document.getElementById("peerVideo")
                videoGrid2.append(video2)
                
            })
        peer.on('close', function () {
                document.getElementById("peerVideo").remove();
                peer.destroy()
             })
            return peer
        }
        function MakePeer() {
            client.gotAnswer = false
            let peer = InitPeer('init')
            peer.on('signal', function (data) {
                if (!client.gotAnswer) {
                    socket.emit('Offer', data)
                }
            })
            client.peer = peer
        }

        function FrontAnswer(offer) {
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
        function CreateVideo(stream) {
            

            let video = document.createElement('video')
            video.id = 'peerVideo'
            video.srcObject = stream
            video.setAttribute('class', 'embed-responsive-item')
            document.querySelector('#peerDiv').appendChild(video)
    
                
            video.play()
            //wait for 1 sec
            setTimeout(() => SendFilter(currentFilter), 1000)

            video.addEventListener('click', () => {
                if (video.volume != 0)
                    video.volume = 0
                else
                    video.volume = 1
            })

        }
        function SessionActive() {
            document.write('Session Active. Please come back later')
        }
        socket.on('BackOffer', FrontAnswer)
        socket.on('BackAnswer', SignalAnswer)
        socket.on('SessionActive', SessionActive)
        socket.on('CreatePeer', MakePeer)
        
     videoGrid.append(video);
    })
    
    
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


   
      
      
function muteUnmute(){
        
        const enabled = mystream.getAudioTracks()[0].enabled;
        if (enabled) {
          mystream.getAudioTracks()[0].enabled = false;
          setUnmuteButton();
        } else {
          setMuteButton();
          mystream.getAudioTracks()[0].enabled = true;
        }
      }
    
      
    function playStop(){
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
      


