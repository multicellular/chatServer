(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-990adafa"],{"0a49":function(e,t,s){var n=s("9b43"),r=s("626a"),o=s("4bf8"),a=s("9def"),i=s("cd1c");e.exports=function(e,t){var s=1==e,c=2==e,u=3==e,d=4==e,h=6==e,m=5==e||h,f=t||i;return function(t,i,l){for(var g,v,p=o(t),b=r(p),R=n(i,l,3),I=a(b.length),w=0,y=s?f(t,I):c?f(t,0):void 0;I>w;w++)if((m||w in b)&&(g=b[w],v=R(g,w,p),e))if(s)y[w]=v;else if(v)switch(e){case 3:return!0;case 5:return g;case 6:return w;case 2:y.push(g)}else if(d)return!1;return h?-1:u||d?d:y}}},1169:function(e,t,s){var n=s("2d95");e.exports=Array.isArray||function(e){return"Array"==n(e)}},"20d6":function(e,t,s){"use strict";var n=s("5ca1"),r=s("0a49")(6),o="findIndex",a=!0;o in[]&&Array(1)[o](function(){a=!1}),n(n.P+n.F*a,"Array",{findIndex:function(e){return r(this,e,arguments.length>1?arguments[1]:void 0)}}),s("9c6c")(o)},"4cc4":function(e,t,s){"use strict";var n=s("f365"),r=s.n(n);r.a},"97aa":function(e,t,s){"use strict";s.r(t);var n=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"page-container",attrs:{id:"chat-wrapper"}},[s("el-breadcrumb",{staticClass:"breadcrumb",attrs:{"separator-class":"el-icon-arrow-right"}},[s("el-breadcrumb-item",{attrs:{to:{path:"chatRoom"}}},[e._v("房间列表")]),s("el-breadcrumb-item",[e._v("聊天页")])],1),s("div",{staticClass:"main-container"},[s("div",{staticClass:"user-con"},[s("div",[e._v("房间成员：")]),s("ul",e._l(e.users,function(t){return s("li",{key:t.id,staticClass:"user-item"},[s("img",{attrs:{src:t.avatarURL}}),s("span",[e._v(e._s(t.name))])])}),0),s("input",{directives:[{name:"model",rawName:"v-model",value:e.joinUserId,expression:"joinUserId"}],attrs:{placeholder:"enter user account"},domProps:{value:e.joinUserId},on:{input:function(t){t.target.composing||(e.joinUserId=t.target.value)}}}),s("button",{staticClass:"join-btn",on:{click:e.joinRoom}},[e._v("邀请加入房间")])]),s("div",{staticClass:"chat-content"},[s("div",{staticClass:"chat-content-hd"},[e._v(e._s(e.curRoom.name))]),s("div",{ref:"scrollView",staticClass:"chat-content-bd"},[s("ul",e._l(e.messages,function(t,n){return s("li",{key:n,class:t.senderId===e.userId?"chat-message-right":"chat-message-left"},[s("img",{staticClass:"chat-avatar",attrs:{src:e.userAvatars[t.senderId]}}),s("div",{staticClass:"chat-message"},[s("p",{staticClass:"chat-name"},[e._v(e._s(e.userNames[t.senderId]))]),t.text?s("p",{staticClass:"chat-text"},[e._v(e._s(t.text))]):t.attachment?s("img",{staticClass:"chat-image",attrs:{src:t.attachment}}):e._e()])])}),0)]),s("div",{staticClass:"chat-content-ft"},[s("input",{directives:[{name:"model",rawName:"v-model",value:e.message,expression:"message"}],attrs:{placeholder:"enter your mseeage ..."},domProps:{value:e.message},on:{input:function(t){t.target.composing||(e.message=t.target.value)}}}),s("button",{on:{click:e.clickSendMessage}},[e._v("send message")])])])])],1)},r=[],o=(s("20d6"),s("7f7f"),s("cebc")),a=s("2f62");function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var c=s("85f2"),u=s.n(c);function d(e,t){for(var s=0;s<t.length;s++){var n=t[s];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),u()(e,n.key,n)}}function h(e,t,s){return t&&d(e.prototype,t),s&&d(e,s),e}var m=s("751a"),f=function(){function e(t){i(this,e),this.apiKey=t}return h(e,[{key:"chatTo",value:function(e){e.sendMessageToRobot=function(e){return m["a"].get("http://www.tuling123.com/openapi/api?key=".concat(this.apiKey,"&info=").concat(e))}}},{key:"receiveMessage",value:function(e){return m["a"].get("http://www.tuling123.com/openapi/api?key=".concat(this.apiKey,"&info=").concat(e))}}]),e}(),l=new f("ac7b6152eb2047a1b7e45678bca5b545"),g={data:function(){return{messages:[],message:"",isRobotRoom:!1,curRoom:{},joinUserId:"",users:[]}},computed:Object(o["a"])({},Object(a["b"])(["user"]),{currentUser:function(){return this.user.chatUser},userId:function(){return this.user.userInfo.id},userAvatars:function(){for(var e={},t={},s=this.users.length,n=0;n<s;n++)t=this.users[n],e[t.id]=t.avatarURL;return e},userNames:function(){for(var e={},t={},s=this.users.length,n=0;n<s;n++)t=this.users[n],e[t.id]=t.name;return e}}),filters:{},created:function(){var e=this;this.curRoom=this.$route.params.room||{},this.isRobotRoom=this.curRoom.customData&&this.curRoom.customData.isRobotRoom,this.curRoom.id&&(this.getMessage(),this.currentUser.subscribeToRoom({roomId:this.curRoom.id,hooks:{onMessage:function(t){var s=t.id,n=t.senderId,r=t.attachment,o=t.text;n!==e.userId&&e.messages.push({senderId:n,attachment:r,text:o,id:s})},onUserJoined:function(){},onUserLeft:function(){}},messageLimit:10}).then(function(t){e.users=t.users,console.log(e.users)}).catch(function(e){return console.log(e)}))},methods:{getMessage:function(){var e=this;this.isRobotRoom||this.currentUser.fetchMessages({roomId:this.curRoom.id,direction:"older",limit:30}).then(function(t){e.messages=t,e.viewToBottom()}).catch(function(e){console.log("Error fetching messages: ".concat(e))})},clickSendMessage:function(){this.isRobotRoom?this.sendMessageToRobot():this.sendMessage()},sendMessageToRobot:function(){var e=this;this.messages.push({senderId:this.userId,text:this.message}),this.viewToBottom(),l.receiveMessage(this.message).then(function(t){e.messages.push({text:t.text,senderId:"ROBOT"}),e.viewToBottom()}).catch(function(){e.messages.push({text:"robot is gone!",type:"3"})}),this.message=""},sendMessage:function(){this.messages.push({senderId:this.userId,text:this.message}),this.viewToBottom(),this.currentUser.sendMessage({text:this.message,roomId:this.curRoom.id}).then(function(){}).catch(function(){}),this.message=""},sendImageMessage:function(e){this.messages.push({senderId:this.userId,attachment:e})},viewToBottom:function(){var e=this;this.$nextTick(function(){e.$refs.scrollView&&(e.$refs.scrollView.scrollTop=e.$refs.scrollView.scrollHeight)})},joinRoom:function(){var e=this;this.currentUser.addUserToRoom({userId:this.joinUserId,roomId:this.curRoom.id}).then(function(t){e.curRoom=t}).catch(function(){}),this.joinUserId=""},getAvatar:function(e){var t=this.users.findIndex(function(t){return t.id===e});return t>-1?(console.log(this.users[t].avatarURL,"avatarURL"),this.users[t].avatarURL):""}},beforeDestory:function(){this.curRoom.id&&this.currentUser.roomSubscriptions[this.curRoom.id].cancel()}},v=g,p=(s("4cc4"),s("2877")),b=Object(p["a"])(v,n,r,!1,null,"066db5e0",null);t["default"]=b.exports},cd1c:function(e,t,s){var n=s("e853");e.exports=function(e,t){return new(n(e))(t)}},e853:function(e,t,s){var n=s("d3f4"),r=s("1169"),o=s("2b4c")("species");e.exports=function(e){var t;return r(e)&&(t=e.constructor,"function"!=typeof t||t!==Array&&!r(t.prototype)||(t=void 0),n(t)&&(t=t[o],null===t&&(t=void 0))),void 0===t?Array:t}},f365:function(e,t,s){}}]);
//# sourceMappingURL=chunk-990adafa.23b9290f.js.map