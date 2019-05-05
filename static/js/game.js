let  user1 = document.querySelector('.game_user1');

let user2 = document.querySelector('.game_user2');

let start = document.querySelector('.start');

let touch = document.querySelector('.touch');

let timed = document.querySelector('.timed');

let stage = document.querySelector('.stage');

let touchIndex = 0, time = 0, startTime = 5;



    
function Game(userData){

    this.userData = userData;

    this.time = 0;

    this.startTime = 5;

    this.touchIndex = 0;

    this.init = function(wsObj, order){

        setTimeout(()=>{

            if(this.startTime == 0){

                $('.touch').on('click',()=>{

                    this.touchIndex++;
                
                    $('.total').text(this.touchIndex);
                })
    
                $('.game_start_second').css('display','none');
    
                this.start(wsObj, order);
            }else{
    
                this.startTime--;
    
                $('.game_start_second>p').text(!this.startTime ? '开始' : this.startTime);
    
                this.init(wsObj, order);
            }
        },1000);
    }

    this.start = function(wsObj, order){

        let isUser1 = this.userData.userID == order.invite.userID, timeID;

        $(`.game_user${isUser1 ? '1' : '2'} >p`).text('this is you!');

        $('.game_bg_content').addClass('game_bg_active');

        $('.game_user1').toggleClass('game_user_run');

        //  人物跑动动画
        setInterval(()=>{

            $('.game_user1,.game_user2').toggleClass('game_user_run');

        }, 120)

        //  1S 间隔判断是否加速
        timeID = setInterval(()=>{

            this.time++;

            $('.timed').text(this.time);

            isUser1 ? order.invite.num = this.touchIndex : order.beInvite.num = this.touchIndex;

            wsObj.send(JSON.stringify({type: 'user_5', order}));

            if(this.time == 10){

                wsObj.send(JSON.stringify({type: 'user_6', order}));

                clearInterval(timeID);
            }

        },1000)
    }

    this.end = function(str){

        $('.game_end>p').text(str);

        $('.game_end').css('display','block');
    }
}


function gameActive(wsObj, order){

    setTimeout(()=>{

        if(startTime == 0){

            $('.game_start_second').css('display','none');

            gameInit(wsObj, order);
        }else{

            startTime--;

            $('.game_start_second>p').text(!startTime ? '开始' : startTime);

            gameActive(wsObj, order);
        }
    },1000);
}

function gameInit(wsObj, order){

    let isUser1 = userData.userID == order.invite.userID, timeID;

    $(`.game_user${isUser1 ? '1' : '2'} >p`).text('this is you!');

    $('.game_bg_content').addClass('game_bg_active');

    user1.classList.toggle('game_user_run');

    //  人物跑动动画
    setInterval(()=>{

        user1.classList.toggle('game_user_run');

        user2.classList.toggle('game_user_run');

    }, 120)

    //  1S 间隔判断是否加速
    timeID = setInterval(()=>{

        time++;

        timed.innerText = time;

        isUser1 ? order.invite.num = touchIndex : order.beInvite.num = touchIndex;

        wsObj.send(JSON.stringify({type: 'user_5', order}));

        if(time == 10){

            // $('.game_end').css('display','block');
            wsObj.send(JSON.stringify({type: 'user_6', order}));

            clearInterval(timeID);
        }

    },1000)
}


