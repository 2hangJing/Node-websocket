
function Game(userData){

    this.userData = userData;

    this.time = 0;

    this.startTime = 5;

    this.touchIndex = 0;

    this.animateID = 0;

    this.init = function(wsObj, order){
        
        $('.game_warp').css('display','block');
        
        $('.game_start_second').css('display','block');

        setTimeout(()=>{

            if(this.startTime == 0){

                $('.touch').off().on('click',()=>{

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
        this.animateID = setInterval(()=>{

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

    this.end = function(str,userData){

        $('.game_end>p').text(str);

        $('.game_end').css('display','block');

        setTimeout(()=>{

            clearInterval(this.animateID);

            Object.assign(userData, {isConfirm: false, num: 0});

            $('.game_end,.game_warp').css('display','none');

            $('.game_bg_content').removeClass('game_bg_active');

            $('.game_start_second>p').text(5);

            $('.game_user1,.game_user2').removeClass('speedUp').find('p').text('');
        }, 5000);
    }
}


