
let login = document.querySelector('.login'),
    login_warp = document.querySelector('.login_warp'),
    loading = document.querySelector('.loading'),
    login_input = document.querySelector('.login_input'),
    login_btn = document.querySelector('.login_btn'),
    wsObj = {};


function ws(userName){

    let userID;

    wsObj = new WebSocket('ws://192.168.1.2:3001');

    let userList = document.querySelector('.userList');

    wsObj.onopen = function () {

        //  关闭 Loading 
        login.style.display = 'none';

        wsObj.send(JSON.stringify({type: 1, data: {userName}}))

        // 响应onmessage事件:
        wsObj.onmessage = function (msg) {

            let data = JSON.parse(msg.data);

            if (data.type == 0) {

                userList.innerHTML = "";

                for(let val of data.data){

                    userList.innerHTML += `
                        <div class='userDetail'>
                            <p class='user'>${val.userName}</p>
                            <span>用户ID为：${val.userID}</span>
                            <span>连接时间：${val.linkTime}</span>
                            <span class='invite' data-id = ${val.userID} data-name = ${val.userName}>邀请</span>
                        </div>`;
                }
            }else if(data.type == 3){

                //  此时的data为 邀请标签内数据

                let isConfirm = confirm(`玩家：${data.data.userName} 邀请你玩游戏！`);

                
                if(isConfirm){
                    //  接收邀请
                    wsObj.send(JSON.stringify({type: 4, data: {userData: data, isConfirm : true}}))
                }
                else{
                    //  拒绝邀请
                    wsObj.send(JSON.stringify({type: 4, data: {userData: data, isConfirm : false}}))
                }

            }else if(data.type == 5){

                if(data.data.isConfirm){

                    //  接受邀请
                }else{

                    //  拒绝邀请
                    alert("对方已拒绝了，你的邀请!");
                }

            }

           
        };
    }
}

login_input.addEventListener('input',function(e){

    let val = this.value;

    if(val.length >= 2){

        login_btn.classList.add('login_btn_active');
    }else{

        login_btn.classList.remove('login_btn_active');
    }
})

login_btn.addEventListener('click',function(e){

    let isInput = this.classList.contains('login_btn_active');

    if(isInput){

        login_warp.style.display = 'none';

        loading.style.display = 'block';

        ws(login_input.value);
    }
})

document.body.addEventListener('click',function(e){

    let isUser = e.target.classList.contains('invite');

    if(isUser){

        let domData = e.target.dataset;

        wsObj.send(JSON.stringify({type: 2, data: {userName: domData.name, userID : domData.id}}))
    }
})



