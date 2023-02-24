var M_WIDTH = 450, M_HEIGHT = 800, game_platform="", app ={stage:{},renderer:{}}, gres, objects = {}, my_data = {}, game_tick = 0, state ="",git_src='';
var some_process = {}, my_choose=false, return_tocken=false;

rnd2=function(min,max) {	
	let r=Math.random() * (max - min) + min
	return Math.round(r * 1000) / 1000
};

irnd=function(min,max) {	

	//exclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

var anim2 = {
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0,visible:false,ready:true, alpha:0},
		
	slot: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	
	any_on : function() {
		
		for (let s of this.slot)
			if (s !== null)
				return true
		return false;		
	},
	
	linear: function(x) {
		return x
	},
	
	kill_all:function(){
		
		for (var i = 0; i < this.slot.length; i++){
			if (this.slot[i] !== null) {
				let s=this.slot[i];
				s.obj.ready=true;					
				s.p_resolve('OK');
				this.slot[i]=null;
			}
		}
		
	},
	
	kill_anim: function(obj) {
		
		for (var i=0;i<this.slot.length;i++){
			if (this.slot[i]!==null){
				if (this.slot[i].obj===obj){
					this.slot[i].obj.ready=true;
					this.slot[i].p_resolve('KILL');	
					this.slot[i]=null;								
				}
			}
		}
	
	},
	
	easeOutBack: function(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutElastic: function(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	
	easeOutSine: function(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic: function(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack: function(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad: function(x) {
		return x * x;
	},
	
	easeOutBounce: function(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},
	
	easeInCubic: function(x) {
		return x * x * x;
	},
	
	ease2back : function(x) {
		return Math.sin(x*Math.PI*2);
	},
	
	easeInOutCubic: function(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	easeBridge: function(x){
		
		if(x<0.154)
			return 1.2-Math.pow(x*10-1.095445,2);
		if(x>0.845)
			return 1.2-Math.pow((1-x)*10-1.095445,2);
		return 1		
	},
		
	shake : function(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
		
		
	},	
	
	add : function(obj, params, vis_on_end, time, func, anim3_origin) {
				
		//если уже идет анимация данного спрайта то отменяем ее
		anim2.kill_anim(obj);

		let f=0;
		//ищем свободный слот для анимации
		for (var i = 0; i < this.slot.length; i++) {

			if (this.slot[i] === null) {

				obj.visible = true;
				obj.ready = false;

				//добавляем дельту к параметрам и устанавливаем начальное положение
				for (let key in params) {
					params[key][2]=params[key][1]-params[key][0];					
					obj[key]=params[key][0];
				}
				
				//для возвратных функцие конечное значение равно начальному
				if (func === 'ease2back')
					for (let key in params)
						params[key][1]=params[key][0];					
					
				this.slot[i] = {
					obj: obj,
					params: params,
					vis_on_end: vis_on_end,
					func: this[func].bind(anim2),
					speed: 0.01818 / time,
					progress: 0
				};
				f = 1;
				break;
			}
		}
		
		if (f===0) {
			console.log("Кончились слоты анимации");	
			
			
			//сразу записываем конечные параметры анимации
			for (let key in params)				
				obj[key]=params[key][1];			
			obj.visible=vis_on_end;
			obj.alpha = 1;
			obj.ready=true;
			
			
			return new Promise(function(resolve, reject){					
			  resolve('NO_SLOT');	  		  
			});	
		}
		else {
			return new Promise(function(resolve, reject){					
			  anim2.slot[i].p_resolve = resolve;	  		  
			});			
			
		}

		
		

	},	
	
	process: function () {
		
		for (var i = 0; i < this.slot.length; i++)
		{
			if (this.slot[i] !== null) {
				
				let s=this.slot[i];
				
				s.progress+=s.speed;		
				
				for (let key in s.params)				
					s.obj[key]=s.params[key][0]+s.params[key][2]*s.func(s.progress);		
				
				//если анимация завершилась то удаляем слот
				if (s.progress>=0.999) {
					for (let key in s.params)				
						s.obj[key]=s.params[key][1];
					
					s.obj.visible=s.vis_on_end;
					if (s.vis_on_end === false)
						s.obj.alpha = 1;
					
					s.obj.ready=true;					
					s.p_resolve('OK');
					this.slot[i] = null;
				}
			}			
		}
		
	}
	
}

var sound = {
	
	on : 1,
	
	play : function(snd_name, loader) {
		
		if (this.on === 0)
			return;
		
		if (loader===undefined)
			return gres[snd_name].sound.play();	
		
		return loader.resources[snd_name].sound.play();	

	}

}

class lb_player_card_class extends PIXI.Container{
	
	constructor(x,y,place) {
		super();

		this.bcg=new PIXI.Sprite(game_res.resources.lb_player_card_bcg.texture);
		this.bcg.interactive=true;
		this.bcg.pointerover=function(){this.tint=0x55ffff};
		this.bcg.pointerout=function(){this.tint=0xffffff};
						
		this.place=new PIXI.BitmapText("1", {fontName: 'Century Gothic', fontSize: 24});
		this.place.x=20;
		this.place.y=20;
		this.place.tint=0x220022;
		
		this.avatar=new PIXI.Sprite();
		this.avatar.x=40;
		this.avatar.y=10;
		this.avatar.width=this.avatar.height=48;
				
		this.name=new PIXI.BitmapText(' ', {fontName: 'Century Gothic', fontSize: 25});
		this.name.x=100;
		this.name.y=20;
		this.name.tint=0x002222;
		
	
		this.record=new PIXI.BitmapText(' ', {fontName: 'Century Gothic', fontSize: 30});
		this.record.x=340;
		this.record.tint=0x002222;
		this.record.y=20;		
		
		this.addChild(this.bcg,this.place, this.avatar, this.name, this.record);		
	}
	
	
}

class acard_class extends PIXI.Container {
		
	constructor(x,y) {
		
		super();
		this.resolver=0;
		//this.bcg=new PIXI.Sprite(gres.avatar_bcg.texture);
		this.amask=new PIXI.Sprite(gres.avatar_mask.texture);
		this.avatar=new PIXI.Sprite();
		this.avatar.mask=this.amask;
		this.frame=new PIXI.Sprite(gres.avatar_frame.texture);
		this.res_icon=new PIXI.Sprite();
		this.res_icon.width=this.res_icon.height=50;
		this.res_icon.visible=false;
		this.res_icon.x=this.res_icon.y=93;
		this.res_icon.anchor.set(0.5,0.5);
		
		this.ind=0;
				
		this.name=new PIXI.BitmapText('My name', {fontName: 'mfont', fontSize :25, align: 'center'});
		this.name.anchor.set(0.5,0);
		this.name.x=60;
		this.name.y=120;
		this.name.maxWidth=130;
		
		this.star_bcg=new PIXI.Sprite(gres.star_img.texture);
		this.star_bcg.anchor.set(0.5,0.5);
		this.star_bcg.x=this.star_bcg.y=20;
		this.star_bcg.scale_xy=0.5;



		this.star_count=new PIXI.BitmapText('125', {fontName: 'mfont', fontSize :20, align: 'center'});
		this.star_count.anchor.set(0.5,0.5);
		this.star_count.x=this.star_count.y=20;
		this.star_count.tint=0x000000;

		this.star_count_change=new PIXI.BitmapText('0', {fontName: 'mfont', fontSize :30, align: 'center'});
		this.star_count_change.anchor.set(0.5,0.5);
		this.star_count_change.x=40;
		this.star_count_change.y=-5;
		this.star_count_change.tint=0xFFFF00;
		this.star_count_change.visible=false;
		
		
		
		this.amask.width=this.avatar.width=this.frame.width=120;
		this.amask.height=this.avatar.height=this.frame.height=120;
		
		this.addChild(this.amask,this.avatar,this.frame,this.name,this.res_icon,this.star_bcg,this.star_count,this.star_count_change);
		
		this.x=this.sx=x;
		this.y=this.sy=y;
		
		this.next_try_time=0;
		this.win_prob=0.25;
		
	}
	
	update_fp_rating(val){
		
		this.star_count_change.text=val>0?'+'+val:val;
		anim2.add(this.star_count_change,{alpha:[1, 0]}, false, 2,'linear');
		const cur_stars=+this.star_count.text;
		let new_stars=cur_stars+val;
		if(new_stars<0) new_stars=0;		
		this.star_count.text=new_stars;
		firebase.database().ref("fp/"+this.uid+"/rating").set(new_stars);
		
	}
	
	update_my_rating(val){
		
		this.star_count_change.text=val>0?'+'+val:val;
		anim2.add(this.star_count_change,{alpha:[1, 0]}, false, 2,'linear');
		const cur_stars=+this.star_count.text;
		let new_stars=cur_stars+val;
		if(new_stars<0) new_stars=0;	
		my_data.rating=new_stars;
		this.star_count.text=new_stars;
		firebase.database().ref("players/"+my_data.uid+"/rating").set(my_data.rating);
		
	}
	
	init_try_time(song_name){
		
		const s_len=song_name.length;
		
		this.win_prob=(this.ind%100)/100;
		console.log(this.win_prob);
		
		
		//это если вообще не знает
		if(Math.random()>0.8){
			this.next_try_time=Date.now()+999999;
			console.log('no idea');
			return;
		}
		
		this.next_try_time=Date.now()+irnd(3000,4000+s_len*1000);
	}
	
	make_a_try(song_name){		
				
		const is_win=Math.random()<this.win_prob;
		
		this.show_try_icon(is_win);
		
		this.init_try_time(song_name);
		
		return is_win;
	}
	
	async show_try_icon(is_correct){		
				
		if(is_correct)
			this.res_icon.texture=gres.cor_img.texture;
		else
			this.res_icon.texture=gres.incor_img.texture;
				
		anim2.add(this.res_icon,{ scale_xy:[0,0.625]}, false, 3,'easeBridge');
	}
	
	
}

class letter_class extends PIXI.Container{
	
	constructor(){
		
		super();
		
		this.bcg=new PIXI.Sprite(gres.letter_bcg.texture);
		this.letter=new PIXI.BitmapText('', {fontName: 'mfont', fontSize :25, align: 'center'});
		
		this.letter.anchor.set(0.5,0.5);
		this.letter.tint=0x333333;
		this.bcg.width=20;
		this.bcg.height=30;
		
		this.letter.x=this.bcg.width/2;
		this.letter.y=this.bcg.height/2;
		this.addChild(this.bcg, this.letter);
		this.y=550;
		
	}
	
	
}

var make_text = function (obj, text, max_width) {
		
	let sum_v=0;
	let f_size=obj.fontSize;
	
	for (let i=0;i<text.length;i++) {
		
		let code_id=text.charCodeAt(i);
		let char_obj=game_res.resources.m2_font.bitmapFont.chars[code_id];
		if (char_obj===undefined) {
			char_obj=game_res.resources.m2_font.bitmapFont.chars[83];			
			text = text.substring(0, i) + 'S' + text.substring(i + 1);
		}		

		sum_v+=char_obj.xAdvance*f_size/64;	
		if (sum_v>max_width) {
			obj.text =  text.substring(0,i-1);					
			return;
		}
	}
	
	obj.text =  text;	
}

var big_message = {
	
	p_resolve : 0,
		
	show: function(t1,t2) {
				
		if (t2!==undefined || t2!=="")
			objects.big_message_text2.text=t2;
		else
			objects.big_message_text2.text='**********';

		objects.big_message_text.text=t1;
			
		anim2.add(objects.big_message_cont,{y:[-180, objects.big_message_cont.sy]}, true, 0.02,'easeOutBack');
				
		return new Promise(function(resolve, reject){					
			big_message.p_resolve = resolve;	  		  
		});
	},

	close : function() {
		
		if (objects.big_message_cont.ready===false)
			return;

		game_res.resources.close.sound.play();
		anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.sy,450]}, false, 0.02,'easeInBack');
		this.p_resolve("close");			
	}

}

keyboard={
	
	p_resolve : 0,
	
	rus_keys : [[28,123,77.13,163,'<'],[30,23,57.45,63,'Й'],[66.6,23,94.05,63,'Ц'],[103.2,23,130.65,63,'У'],[139.8,23,167.25,63,'К'],[176.4,23,203.85,63,'Е'],[213,23,240.45,63,'Н'],[249.6,23,277.05,63,'Г'],[286.2,23,313.65,63,'Ш'],[322.8,23,350.25,63,'Щ'],[359.4,23,386.85,63,'З'],[396,23,423.45,63,'Х'],[432.6,23,460.05,63,'Ъ'],[48.3,73,75.75,113,'Ф'],[84.9,73,112.35,113,'Ы'],[121.5,73,148.95,113,'В'],[158.1,73,185.55,113,'А'],[194.7,73,222.15,113,'П'],[231.3,73,258.75,113,'Р'],[267.9,73,295.35,113,'О'],[304.5,73,331.95,113,'Л'],[341.1,73,368.55,113,'Д'],[377.7,73,405.15,113,'Ж'],[414.3,73,441.75,113,'Э'],[83.6,123,111.05,163,'Я'],[120.2,123,147.65,163,'Ч'],[156.8,123,184.25,163,'С'],[193.4,123,220.85,163,'М'],[230,123,257.45,163,'И'],[266.6,123,294.05,163,'Т'],[303.2,123,330.65,163,'Ь'],[339.8,123,367.25,163,'Б'],[376.4,123,403.85,163,'Ю'],[412,123,462,163,'V']],
	open: function(){
				
		anim2.add(objects.keyboard_cont,{y:[950, objects.keyboard_cont.sy]}, true, 1,'linear');
				
		return new Promise(function(resolve, reject){					
			keyboard.p_resolve = resolve;	  		  
		});
		
	},
		
	close:function(){
		
		anim2.add(objects.keyboard_cont,{y:[objects.keyboard_cont.y,950]}, false, 1,'linear');
		
	},
		
	keydown:function(key){
				
		
		key = key.toUpperCase();
		
		
		if(key==='BACKSPACE') key ='<';
		if(key==='ENTER') key ='V';
			
		var result = this.rus_keys.find(k => {
			return k[4] === key
		})
		
		
		
		if (result === undefined) return;
		sound.play('keypress');
		this.pointerdown(null,result)
		
	},
		
	pointerdown:function(e, inp_key){
		
		let key = -1;
		let key_x = 0;
		let key_y = 0;	
		
		if (e !== null) {
			
			let mx = e.data.global.x/app.stage.scale.x - objects.keyboard.x;
			let my = e.data.global.y/app.stage.scale.y - objects.keyboard.y;;

			let margin = 5;
			for (let k of this.rus_keys) {			
				if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin) {
					key = k[4];
					key_x = k[0];
					key_y = k[1];
					break;
				}
			}			
			
		} else {
			
			key = inp_key[4];
			key_x = inp_key[0];
			key_y = inp_key[1];			
		}			
				
				
		if (key === -1) return;	
		
		//подсвечиваем клавишу
		objects.hl_key.x = objects.keyboard.x+key_x - 20;
		objects.hl_key.y = objects.keyboard.y+key_y - 20;		
		if (key === 'V' || key === '<')
			objects.hl_key.texture = gres.hl_key1.texture;
		else
			objects.hl_key.texture = gres.hl_key0.texture;	
		
		anim2.add(objects.hl_key,{alpha:[1, 0]}, false, 0.5,'linear');
				
		l_board.key_down(key);


	}
		
}

ad = {
	
	prv_show : -9999,
		
	show : function() {
		
		if ((Date.now() - this.prv_show) < 100000 )
			return false;
		this.prv_show = Date.now();
		
		if (game_platform==='YANDEX') {			
			//показываем рекламу
			window.ysdk.adv.showFullscreenAdv({
			  callbacks: {
				onClose: function() {}, 
				onError: function() {}
						}
			})
		}
		
		if (game_platform==='VK') {
					 
			vkBridge.send("VKWebAppShowNativeAds", {ad_format:"interstitial"})
			.then(data => console.log(data.result))
			.catch(error => console.log(error));	
		}			
		
		if (game_platform==='CRAZYGAMES') {				
			try {
				const crazysdk = window.CrazyGames.CrazySDK.getInstance();
				crazysdk.init();
				crazysdk.requestAd('midgame');		
			} catch (e) {			
				console.error(e);
			}	
		}	
		
		if (game_platform==='GM') {
			sdk.showBanner();
		}
		return true;
	},
	
	show2 : async function() {
		
		
		if (game_platform ==="YANDEX") {
			
			let res = await new Promise(function(resolve, reject){				
				window.ysdk.adv.showRewardedVideo({
						callbacks: {
						  onOpen: () => {},
						  onRewarded: () => {resolve('ok')},
						  onClose: () => {resolve('err')}, 
						  onError: (e) => {resolve('err')}
					}
				})
			
			})
			return res;
		}
		
		if (game_platform === "VK") {	

			let res = '';
			try {
				res = await vkBridge.send("VKWebAppShowNativeAds", { ad_format: "reward" })
			}
			catch(error) {
				res ='err';
			}
			
			return res;				
			
		}	
		
		return 'err';
		
	}

}

function vis_change() {
	
	if (document.hidden===true) {
		break_to_main_menu();
	}	
}

auth2 = {
		
	load_script : function(src) {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.appendChild(script)
	  })
	},
			
	get_random_char : function() {		
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		return chars[irnd(0,chars.length-1)];
		
	},
	
	get_random_uid_for_local : function(prefix) {
		
		let uid = prefix;
		for ( let c = 0 ; c < 12 ; c++ )
			uid += this.get_random_char();
		
		//сохраняем этот uid в локальном хранилище
		try {
			localStorage.setItem('poker_uid', uid);
		} catch (e) {alert(e)}
					
		return uid;
		
	},
	
	get_random_name : function(uid) {
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		const rnd_names = ['Gamma','Chime','Dron','Perl','Onyx','Asti','Wolf','Roll','Lime','Cosy','Hot','Kent','Pony','Baker','Super','ZigZag','Magik','Alpha','Beta','Foxy','Fazer','King','Kid','Rock'];
		
		if (uid !== undefined) {
			
			let e_num1 = chars.indexOf(uid[3]) + chars.indexOf(uid[4]) + chars.indexOf(uid[5]) + chars.indexOf(uid[6]);
			e_num1 = Math.abs(e_num1) % (rnd_names.length - 1);				
			let name_postfix = chars.indexOf(uid[7]).toString() + chars.indexOf(uid[8]).toString() + chars.indexOf(uid[9]).toString() ;	
			return rnd_names[e_num1] + name_postfix.substring(0, 3);					
			
		} else {

			let rnd_num = irnd(0, rnd_names.length - 1);
			let rand_uid = irnd(0, 999999)+ 100;
			let name_postfix = rand_uid.toString().substring(0, 3);
			let name =	rnd_names[rnd_num] + name_postfix;				
			return name;
		}	
	},	
	
	get_country_code : async function() {
		
		let country_code = ''
		try {
			let resp1 = await fetch("https://ipinfo.io/json");
			let resp2 = await resp1.json();			
			country_code = resp2.country;			
		} catch(e){}

		return country_code;
		
	},
	
	search_in_local_storage : function() {
		
		//ищем в локальном хранилище
		let local_uid = null;
		
		try {
			local_uid = localStorage.getItem('poker_uid');
		} catch (e) {alert(e)}
				
		if (local_uid !== null) return local_uid;
		
		return undefined;	
		
	},
	
	init : async function() {	
				
		if (game_platform === 'YANDEX') {			
		
			try {await this.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};										
					
			let _player;
			
			try {
				window.ysdk = await YaGames.init({});			
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};
			
			my_data.uid = _player.getUniqueID().replace(/[\/+=]/g, '');
			my_data.name = _player.getName();
			my_data.pic_url = _player.getPhoto('medium');
			
			if (my_data.pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';
			
			if (my_data.name === '')
				my_data.name = this.get_random_name(my_data.uid);
			
			//если английский яндекс до добавляем к имени страну
			let country_code = await this.get_country_code();
			my_data.name = my_data.name + ' (' + country_code + ')';			


			
			return;
		}
		
		if (game_platform === 'VK') {
			
			try {await this.load_script('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')} catch (e) {alert(e)};
			
			let _player;
			
			try {
				await vkBridge.send('VKWebAppInit');
				_player = await vkBridge.send('VKWebAppGetUserInfo');				
			} catch (e) {alert(e)};

			
			my_data.name 	= _player.first_name + ' ' + _player.last_name;
			my_data.uid 	= "vk"+_player.id;
			my_data.pic_url = _player.photo_100;
			
			return;
			
		}
		
		if (game_platform === 'GOOGLE_PLAY') {	

			let country_code = await this.get_country_code();
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GP_');
			my_data.name = this.get_random_name(my_data.uid) + ' (' + country_code + ')';
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			return;
		}
		
		if (game_platform === 'DEBUG') {		

			my_data.name = my_data.uid = 'debug' + prompt('Отладка. Введите ID', 100);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';		
			return;
		}
		
		if (game_platform === 'CRAZYGAMES') {
			
			let country_code = await this.get_country_code();
			try {await this.load_script('https://sdk.crazygames.com/crazygames-sdk-v1.js')} catch (e) {alert(e)};			
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('CG_');
			my_data.name = this.get_random_name(my_data.uid) + ' (' + country_code + ')';
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			let crazysdk = window.CrazyGames.CrazySDK.getInstance();
			crazysdk.init();			
			return;
		}
		
		if (game_platform === 'UNKNOWN') {
			
			//если не нашли платформу
			alert('Неизвестная платформа. Кто Вы?')
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('LS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
		}
	}
	
}

var lb={
	
	add_game_to_vk_menu_shown:0,
	cards_pos: [[20,300],[20,355],[20,410],[20,465],[20,520],[20,575],[20,630]],
	
	activate: function() {
			
		
	
		anim2.add(objects.lb_cards_cont,{x:[450, 0]}, true, 0.03,'linear');
		
		objects.lb_cards_cont.visible=true;
		objects.lb_back_button.visible=true;
		
		for (let i=0;i<7;i++) {			
			objects.lb_cards[i].x=this.cards_pos[i][0];
			objects.lb_cards[i].y=this.cards_pos[i][1];	
			objects.lb_cards[i].place.text=(i+4)+".";			
		}		
		
		this.update();		
	},
	
	close: function() {
							
			
				
		anim2.add(objects.lb_1_cont,{x:[objects.lb_1_cont.x, -450]}, false, 0.03,'linear');
		anim2.add(objects.lb_2_cont,{x:[objects.lb_2_cont.x, -450]}, false, 0.03,'linear');
		anim2.add(objects.lb_3_cont,{x:[objects.lb_3_cont.x, -450]}, false, 0.03,'linear');
		anim2.add(objects.lb_cards_cont,{x:[objects.lb_cards_cont.x, -450]}, false, 0.03,'linear');			

		//gres.close.sound.play();
		
		
		//показываем меню по выводу игры в меню
		if (this.add_game_to_vk_menu_shown===1)
			return;
		
		if (game_platform==='VK')
			vkBridge.send('VKWebAppAddToFavorites');
		
		this.add_game_to_vk_menu_shown=1;
		
	},
	
	back_button_down: function() {
		
		if (any_dialog_active===1 || objects.lb_1_cont.ready===false) {
			game_res.resources.locked.sound.play();
			return
		};	
		
		
		game_res.resources.click.sound.play();
		
		this.close();
		main_menu.activate();
		
	},
	
	update: function () {
		
		
		firebase.database().ref("players").orderByChild('record').limitToLast(25).once('value').then((snapshot) => {
			
			if (snapshot.val()===null) {
			  console.log("Что-то не получилось получить данные о рейтингах");
			}
			else {				
				
				
				objects.lb_1_cont.cacheAsBitmap  = false;
				objects.lb_2_cont.cacheAsBitmap  = false;
				objects.lb_3_cont.cacheAsBitmap  = false;	
				
				var players_array = [];
				snapshot.forEach(players_data=> {			
					if (players_data.val().name!=="" && players_data.val().name!=='')
						players_array.push([players_data.val().name, players_data.val().record, players_data.val().pic_url]);	
				});
				

				players_array.sort(function(a, b) {	return b[1] - a[1];});
				
				
				//загружаем аватары
				var loader = new PIXI.Loader();
								
				var len=Math.min(10,players_array.length);
				
				//загружаем тройку лучших
				for (let i=0;i<3;i++) {
					let p = players_array[i];
					if (p === undefined)
						break;
					
					let fname=p[0];					
					make_text(objects['lb_'+(i+1)+'_name'],fname,180);
										
					//objects['lb_'+(i+1)+'_name'].text=fname;
					objects['lb_'+(i+1)+'_balance'].text = p[1];					
					
					
					let pic_url = p[2];
					
					//меняем адрес который невозможно загрузить
					if (pic_url==="https://vk.com/images/camera_100.png")
						pic_url = "https://i.ibb.co/fpZ8tg2/vk.jpg";					
					
					loader.add('leaders_avatar_'+i, pic_url, {loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 4000});
				};
				
				//загружаем остальных
				for (let i=3;i<10;i++) {
					
					let p = players_array[i];

					if (p === undefined)
						break;
					
					let fname=p[0];		
					
					make_text(objects.lb_cards[i-3].name,fname,200);
					
					objects.lb_cards[i-3].record.text=players_array[i][1]	;					
					loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 3000});					
					
				};
				
				
				
				loader.load((loader, resources) => {
					

					for (let i=0;i<3;i++)
						objects['lb_'+(i+1)+'_avatar'].texture=resources['leaders_avatar_'+i].texture;						

					objects.lb_1_cont.cacheAsBitmap  = true;
					objects.lb_2_cont.cacheAsBitmap  = true;
					objects.lb_3_cont.cacheAsBitmap  = true;		
					
					anim2.add(objects.lb_1_cont,{x:[450,objects.lb_1_cont.sx]}, false, 0.03,'linear');
					anim2.add(objects.lb_2_cont,{x:[450,objects.lb_1_cont.sx]}, false, 0.03,'linear');
					anim2.add(objects.lb_3_cont,{x:[450,objects.lb_1_cont.sx]}, false, 0.03,'linear');
					
					
					for (let i=3;i<10;i++)						
						objects.lb_cards[i-3].avatar.texture=resources['leaders_avatar_'+i].texture;

				});
			}

		});
		
	}
	
}

async function load_user_data() {
	
	try {
	
	
		//анимация лупы
		some_process.loup_anim=function() {
			objects.id_loup.x=20*Math.sin(game_tick*8)+90;
			objects.id_loup.y=20*Math.cos(game_tick*8)+110;
		}
	
		//получаем данные об игроке из социальных сетей
		await auth2.init();
			
		//устанавлием имя на карточки
		make_text(objects.id_name,my_data.name,150);
		//make_text(objects.player0.name,my_data.name,150);
			
		//ждем пока загрузится аватар
		let loader=new PIXI.Loader();
		loader.add("my_avatar", my_data.pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});			
		await new Promise((resolve, reject)=> loader.load(resolve))
		
		objects.id_avatar.texture=objects.player0.avatar.texture=loader.resources.my_avatar.texture;
		
		//получаем остальные данные об игроке
		let _other_data = await firebase.database().ref("players/" + my_data.uid).once('value');
		let other_data = _other_data.val();
			
		my_data.rating = (other_data && other_data.rating) || 0;
		my_data.games = (other_data && other_data.games) || 0;
		my_data.name = (other_data && other_data.name) || my_data.name;
			
			
		//отключение от игры и удаление не нужного
		//firebase.database().ref("inbox/"+my_data.uid).onDisconnect().remove();
		//firebase.database().ref(room_name+'/'+my_data.uid).onDisconnect().remove();			

		//устанавливаем рейтинг в попап
		objects.id_record.text=objects.player0.star_count.text=my_data.rating;
		objects.player0.name.text=my_data.name;

		
		//обновляем почтовый ящик
		//firebase.database().ref("inbox/"+my_data.uid).set({sender:"-",message:"-",tm:"-",data:{x1:0,y1:0,x2:0,y2:0,board_state:0}});

		//подписываемся на новые сообщения
		//firebase.database().ref("inbox/"+my_data.uid).on('value', (snapshot) => { process_new_message(snapshot.val());});

		//обновляем данные в файербейс так как могли поменяться имя или фото
		firebase.database().ref("players/"+my_data.uid).set({name:my_data.name, pic_url: my_data.pic_url, rating : my_data.rating, games : my_data.games, tm:firebase.database.ServerValue.TIMESTAMP});

		//устанавливаем мой статус в онлайн
		//set_state({state : 'o'});



		//это событие когда меняется видимость приложения
		document.addEventListener("visibilitychange", vis_change);

		//keep-alive сервис
		setInterval(function()	{keep_alive()}, 40000);

	
		//ждем и убираем попап
		await new Promise((resolve, reject) => setTimeout(resolve, 1000));
		

		anim2.add(objects.id_cont,{y:[objects.id_cont.y, -200]}, false, 1,'easeInBack');
		
		some_process.loup_anim=function() {};
		
	
	} catch (error) {		
		alert (error);		
	}
	
}

async function define_platform_and_language() {
	
	let s = window.location.href;
	
	if (s.includes('yandex')) {
		
		game_platform = 'YANDEX';
		
		if (s.match(/yandex\.ru|yandex\.by|yandex\.kg|yandex\.kz|yandex\.tj|yandex\.ua|yandex\.uz/))
			LANG = 0;
		else 
			LANG = 1;		
		return;
	}
	
	if (s.includes('vk.com')) {
		game_platform = 'VK';	
		LANG = 0;	
		return;
	}
	
	if (s.includes('google_play')) {
			
		game_platform = 'GOOGLE_PLAY';	
		LANG = await language_dialog.show();
		return;
	}	
	
	if (s.includes('crazygames')) {
			
		game_platform = 'CRAZYGAMES';	
		LANG = 1;
		return;
	}
	
	if (s.includes('192.168')) {
			
		game_platform = 'DEBUG';	
		LANG = 0;
		return;	
	}	
	
	game_platform = 'UNKNOWN';	
	LANG = await language_dialog.show();
	
	

}

fake_players={
	
	users:{},
	resolver:0,
	
	start(){
		
		let script = document.createElement('script');
		let token='vk1.a.f8aHIKv6_L28bxB58x5B5jskKepaPhUYnq-GnkV6w6VMl-flN07fWB88vlLhJw_clgGsGkZ-FjapQJ7tdndDT5qiVSqfAawT7FG4wdCp5UXI5OkpNObKUZdPa0hyuJJZnWux5qs43tvFyOyMceeVqI8gxTiqhMOVKLrQP1b2PfKN7rNHfscn07uPi2Rhl6mQ';
		let city_id=irnd(0,100);
		let q='';
		let hhh='https://api.vk.com/method/users.search?q=';
		hhh+=q;
		hhh+='&count=1000&fields=photo_100,last_seen&city_id=';
		hhh+=city_id;
		hhh+='&birth_day=';
		hhh+=irnd(0,25);
		hhh+='&birth_month=';
		hhh+=irnd(0,11);	
		hhh+='&status=';
		hhh+=irnd(0,8);	
		hhh+='&has_photo=1&access_token=';
		hhh+=token;
		hhh+='&v=5.131';
		hhh+='&callback=fake_players.response';
			
		script.src = hhh;	
		document.head.appendChild(script);
		
	},
	
	async run(){
		
		
		let players_cnt=0;
		
		for(let i=0;i<100000;i++){
			
			let data=await new Promise((res,rej)=>{
				fake_players.resolver=res;				
				fake_players.start();				
			})			
			
			data.forEach(p=>{
				
				if(p.last_seen) {
					
					const name=p.first_name+' '+p.last_name;
					const uid=p.id+p.first_name+p.last_name;	
					const pic_url=p.photo_100;
					
					if(/^[a-zA-Zа-яА-Я]+$/.test(p.first_name+p.last_name)===true && p.last_seen.time<1623101792 && this.users[uid]===undefined){
	
						this.users[uid]={};
						this.users[uid].uid=uid;
		
						firebase.database().ref("fp/"+players_cnt).set({uid,name,pic_url});
						players_cnt++;
					}					
				}
				
			})
			
			
			console.log('Уже набрано: '+Object.keys(this.users).length);
			//console.log("Ждем 3 сек...")
			await new Promise((resolve, reject) => setTimeout(resolve, 3000));
		}
		
	
	},
	
	response(data){		

		fake_players.resolver(data.response.items);

	},
	
	async update_rating(){		

		for (let i=0;i<8881;i++){
			
			await firebase.database().ref("fp/"+i+"/raiting").remove();		
			await firebase.database().ref("fp/"+i+"/rating").set(irnd(0,10));			
			if(Math.random()>0.98)
				await new Promise((resolve, reject) => setTimeout(resolve, 2000));
			console.log(i);
		}		
	}
	
}

async function init_game_env() {
	
	
	//инициируем файербейс
	if (firebase.apps.length===0) {
		firebase.initializeApp({
			apiKey: "AIzaSyBG9xnBLS3eGtn7gy58hNVJBSBVUymxA0I",
			authDomain: "melody-4ab2b.firebaseapp.com",
			databaseURL: "https://melody-4ab2b-default-rtdb.europe-west1.firebasedatabase.app",
			projectId: "melody-4ab2b",
			storageBucket: "melody-4ab2b.appspot.com",
			messagingSenderId: "950545734258",
			appId: "1:950545734258:web:bddf99bf8907891702c0eb"
		});
	}	
	
	
	//fake_players.update_rating();return;
			
	await define_platform_and_language();
								
	document.getElementById("m_bar").outerHTML = "";
    document.getElementById("m_progress").outerHTML = "";
		
	//создаем приложение пикси и добавляем тень
	app.stage = new PIXI.Container();
	app.renderer = new PIXI.Renderer({width:M_WIDTH, height:M_HEIGHT,antialias:true});
	document.body.appendChild(app.renderer.view).style["boxShadow"] = "0 0 15px #000000";

    var resize = function () {
        const vpw = window.innerWidth; // Width of the viewport
        const vph = window.innerHeight; // Height of the viewport
        let nvw; // New game width
        let nvh; // New game height

        if (vph / vpw < M_HEIGHT / M_WIDTH) {
            nvh = vph;
            nvw = (nvh * M_WIDTH) / M_HEIGHT;
        } else {
            nvw = vpw;
            nvh = (nvw * M_HEIGHT) / M_WIDTH;
        }
        app.renderer.resize(nvw, nvh);
        app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT);
    }
	
	//загружаем список песен
	await auth2.load_script("https://akukamil.github.io/melody/songs.txt");

    resize();
    window.addEventListener("resize", resize);
	window.addEventListener('keydown', function(event) { keyboard.keydown(event.key)});

    //создаем спрайты и массивы спрайтов и запускаем первую часть кода
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)
        switch (obj_class) {
        case "sprite":
            objects[obj_name] = new PIXI.Sprite(game_res.resources[obj_name].texture);
            eval(load_list[i].code0);
            break;

        case "block":
            eval(load_list[i].code0);
            break;

        case "cont":
            eval(load_list[i].code0);
            break;

        case "array":
			var a_size=load_list[i].size;
			objects[obj_name]=[];
			for (var n=0;n<a_size;n++)
				eval(load_list[i].code0);
            break;
        }
    }

    //обрабатываем вторую часть кода в объектах
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing2: ' + obj_name)
        switch (obj_class) {
        case "sprite":
            eval(load_list[i].code1);
            break;

        case "block":
            eval(load_list[i].code1);
            break;

        case "cont":	
			eval(load_list[i].code1);
            break;

        case "array":
			var a_size=load_list[i].size;
				for (var n=0;n<a_size;n++)
					eval(load_list[i].code1);	;
            break;
        }
    }
			
	//загружаем данные об игроке
	load_user_data();
		
	main_menu.activate();
	
    //запускаем главный цикл
    main_loop();
}

function load_resources() {
	
	//PIXI.Loader.registerPlugin(PIXI.gif.AnimatedGIFLoader);
    game_res = new PIXI.Loader();
		
	//короткая ссылка на ресурсы
	gres=game_res.resources;
	
	git_src="https://akukamil.github.io/melody/"
	//git_src=""
	

	
	game_res.add("m2_font", git_src+"/fonts/Neucha/font.fnt");

	game_res.add('op_correct',git_src+'sounds/op_correct.mp3');
	game_res.add('click',git_src+'sounds/click.mp3');
	game_res.add('close',git_src+'sounds/close.mp3');
	game_res.add('lose',git_src+'sounds/lose.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');
	game_res.add('applause',git_src+'sounds/applause.mp3');
	game_res.add('wrong',git_src+'sounds/wrong.mp3');
	game_res.add('opponent_win',git_src+'sounds/opponent_win.mp3');
	game_res.add('player_found',git_src+'sounds/player_found.mp3');
	game_res.add('keypress',git_src+'sounds/keypress.mp3');
	
    //добавляем из листа загрузки
    for (var i = 0; i < load_list.length; i++) {
		
        if (load_list[i].class === "sprite" )
            game_res.add(load_list[i].name, git_src+"res/RUS/" + load_list[i].name + "." +  load_list[i].image_format);		
		
        if (load_list[i].class === "image")
            game_res.add(load_list[i].name, git_src+"res/RUS/" + load_list[i].name + "." +  load_list[i].image_format);
	}

		
    game_res.load(init_game_env);
    game_res.onProgress.add(progress);

    function resize_screen() {
        const vpw = window.innerWidth; // Width of the viewport
        const vph = window.innerHeight; // Height of the viewport
        let nvw; // New game width
        let nvh; // New game height

        if (vph / vpw < M_HEIGHT / M_WIDTH) {
            nvh = vph;
            nvw = (nvh * M_WIDTH) / M_HEIGHT;
        } else {
            nvw = vpw;
            nvh = (nvw * M_HEIGHT) / M_WIDTH;
        }
        app.renderer.resize(nvw, nvh);
        app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT);
    }

    function progress(loader, resource) {

        document.getElementById("m_bar").style.width = Math.round(loader.progress) + "%";
    }

}

var now, then=Date.now(), elapsed,time_per_frame=1000/65;
function main_loop() {

	now = Date.now();
	elapsed = now-then;
	
    if (elapsed > time_per_frame) {
		
		then = now;
		
		game_tick+=0.016666666;
		anim2.process();
		
		//обрабатываем минипроцессы
		for (let key in some_process)
			some_process[key]();		
		
	}

	//отображаем сцену
	app.renderer.render(app.stage);		
	requestAnimationFrame(main_loop);
}

var keep_alive = function() {
	
	firebase.database().ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);
	firebase.database().ref("inbox/"+my_data.uid).onDisconnect().remove();
	//firebase.database().ref(room_name+'/'+my_data.uid).onDisconnect().remove();

	//set_state({});
}

l_board={
	
	cells_num:0,
	filled:0,
	letter_id:0,
	line0:'',
	start_filled:3,
	
	key_down(key){
				
		if(key==='<'){			
			if (this.filled>0)
				objects.letters[--this.filled].letter.text='';
			return;
		}
		
		if(key==='V'){			
			game.check_song();
			return;
		}
		
		if(this.filled>=this.cells_num)
			return;

		objects.letters[this.filled].letter.text=key;
		this.filled++;
		
	},
	
	place_line(str,ypos){
		
		let s_len=0;
		
		const c_len=objects.letters[0].bcg.width;
		
		for(let c of str) {
			if (c===' '){
				s_len+=c_len*0.5;		
				
			}else{
				s_len+=c_len;
				this.cells_num++;
			}
		}
				
		let xpos=(450-s_len)/2;
		for (let i=0;i<str.length;i++){
			
			const l=str[i];			
			if (l===' '){
				xpos+=c_len*0.5;			
				
			}else{
				objects.letters[this.letter_id].y=ypos;
				objects.letters[this.letter_id].x=xpos;
				objects.letters[this.letter_id].letter.text='';	
				objects.letters[this.letter_id].visible=true;
				this.letter_id++;
				xpos+=c_len;
			}			
		}	
		
	},
	
	init(song_name){
		
		this.start_filled=0;
		if(my_data.rating<10){
			this.start_filled=3;			
			if(song_name.length<5)
				this.start_filled=1;
		}

		
		const words=song_name.split(' ');
		const num_of_words=words.length;
		const num_of_c=song_name.length;		
		let cells_struct=[num_of_words,0]
		if(num_of_c>20) {			
			if(num_of_words>0) {
				cells_struct=[num_of_words-1,1]
			}			
		}
		
		this.line0=words.slice(0,cells_struct[0]).join(' ');
		let line1=words.slice(-cells_struct[1]).join(' ');
		if(cells_struct[1]===0)
			line1='';
		
		//формируем линии
		this.letter_id=0;
		this.cells_num=0;
		this.filled=0;
		if (line1===''){
			this.place_line(this.line0,575);
		}else{
			this.place_line(this.line0,555);
			this.place_line(line1,595);			
			
		}
		
		//подсказка начальная
		this.add_starting_hint();


		
	},
	
	add_starting_hint(){
		
		//добавляем несколько букс
		const song_name=this.line0.replace(/\s/g, '')
		this.filled=this.start_filled;
		for(let c=0;c<this.start_filled;c++)
			objects.letters[c].letter.text=song_name[c];		
		
	},
	
	get_song_name(){
		
		let song_name='';
		for (let c=0;c<this.filled;c++){
			song_name+=objects.letters[c].letter.text
		}
		return song_name;		
		
	},
	
	clear(){
		
		
		objects.letters.forEach(l=>{
			l.letter.text='';			
		})
		
		this.add_starting_hint();

		
	}
	
}

main_menu = {
		
	activate(){
		
		anim2.add(objects.main_buttons_cont,{y:[800,objects.main_buttons_cont.sy]}, true, 0.5,'easeOutBack');	
		anim2.add(objects.header0,{y:[-400,objects.header0.sy]}, true, 0.5,'easeOutBack');	
		some_process.main_menu=this.process.bind(this);
		
	},
	
	play_down() {

		if(anim2.any_on()===true)
			return;

		return_tocken=false;
		this.close();		
		search_menu.activate();
		
	},
	
	process(){
		
		objects.header0.rotation=Math.sin(game_tick)*0.2;
		
	},
	
	close () {
		
		anim2.add(objects.main_buttons_cont,{y:[objects.main_buttons_cont.sy,800]}, false, 0.5,'easeInBack');	
		anim2.add(objects.header0,{y:[objects.header0.sy,-400]}, false, 0.5,'easeInBack');
	}
	
}

search_menu={
	
	fp_data:0,
	change_avatar_time:0,
	avatar_iterator:0,
	FP_TO_LOAD:5,
	
	activate(){
		
		objects.search_cont.visible=true;
		some_process.search_menu=this.process.bind(this);
		anim2.add(objects.player0,{y:[-180, objects.player0.sy]}, true, 0.5,'easeOutBack');
		this.anim_notes();
		this.load_photos();
		
	},
	
	get_unique_valus(N,min_inc,max_inc){
		
		let uset = new Set();
		while (uset.size < N) {
		let rint = Math.floor(Math.random() * (max_inc - min_inc + 1)) + min_inc;
			uset.add(rint);
		}
		return Array.from(uset);		
	},
	
	async load_photos(){
		
		const fp_ids=this.get_unique_valus(this.FP_TO_LOAD,0,8880);
		
		this.fp_data=[];
		let loader=new PIXI.Loader();
		
		//загружаем фотки
		for (let i=0;i<this.FP_TO_LOAD;i++){
			
			const fp_id=fp_ids[i];
			const snapshot = await firebase.database().ref("fp/"+fp_id).once('value');
			const fp_fb_data = snapshot.val();

			loader.add(fp_fb_data.uid, fp_fb_data.pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});
			await new Promise((resolve, reject)=> loader.load(resolve));

			objects.search_avatar_and_name_cont.visible=true;
			objects.search_photo_block.texture=loader.resources[fp_fb_data.uid].texture;
			objects.search_name.text=fp_fb_data.name;
			
			this.fp_data.push({uid:fp_id, name:fp_fb_data.name,rating:fp_fb_data.rating,texture:loader.resources[fp_fb_data.uid].texture});
			if(return_tocken) return;
		}		
				
		//добавляем игроков
		
		await this.add_fp(objects.player1);
		if(return_tocken) return;
		
		await new Promise((resolve, reject) => setTimeout(resolve, irnd(2000,5000)));
		if(return_tocken) return;
		
		await this.add_fp(objects.player2);
		if(return_tocken) return;
		
		this.close();
		game.activate();
		
	},
	
	async add_fp(player_obj){
		
		let fp_ind=irnd(0,8881);
		
		if(player_obj===objects.player1){
			while(fp_ind===objects.player2.uid)
				fp_ind=irnd(0,8881);
		}else{
			while(fp_ind===objects.player1.uid)
				fp_ind=irnd(0,8881);
		}
		
		const _data = await firebase.database().ref("fp/"+fp_ind).once('value');
		const fp_fb_data = _data.val();
		
		let loader=new PIXI.Loader();
		loader.add(fp_ind.toString(), fp_fb_data.pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});
		await new Promise((resolve, reject)=> loader.load(resolve));
		
		if(return_tocken) return;
		
		player_obj.ind=fp_ind;
		player_obj.avatar.texture=loader.resources[fp_ind].texture;
		player_obj.name.text=fp_fb_data.name;
		player_obj.star_count.text=fp_fb_data.rating;
		anim2.add(player_obj,{y:[-180, player_obj.sy]}, true, 0.5,'easeOutBack');
		sound.play('player_found');
		
	},
	
	close(){
		this.on=false;
		objects.search_cont.visible=false;	
		some_process.search_menu=function(){};		
	},
		
	async anim_notes(){
		
		
		let prv_note_index=0;
		while(true) {
			
			for(let i=0;i<4;i++){			
				
				objects.search_opp_note[prv_note_index].texture=gres.note_tex.texture;
				objects.search_opp_note[i].texture=gres.note_tex1.texture;
				prv_note_index=i;
				await new Promise((resolve, reject) => setTimeout(resolve, 500));
				if(return_tocken) return;
				
			}	
			
		}
	
		
	},
	
	process(){
		
		objects.search_opp_header.y=objects.search_opp_header.sy+Math.sin(game_tick*5)*10;
		
		if(this.fp_data.length===this.FP_TO_LOAD) {
			
			if(game_tick>this.change_avatar_time){
				
				objects.search_photo_block.texture=this.fp_data[this.avatar_iterator%5].texture;
				objects.search_name.text=this.fp_data[this.avatar_iterator%5].name;			
				this.change_avatar_time=game_tick+0.25;
				this.avatar_iterator++;
			}			
			
			
		}


	
		
	}
	
}

break_to_main_menu=function(){
	
	return_tocken=true;
	anim2.kill_all();
	app.stage.children.forEach(c=>c.visible=false);
	some_process.main_menu=function(){};
	some_process.game=function(){};
	clearInterval(game.timer);
	main_menu.activate();
	if(game.song_sound && game.song_sound.isPlaying)
		game.song_sound.stop();
		
}

game = {
	
	song_instance:0,
	song_sound:0,
	song_index:0,
	song_obj:{},
	play_start:0,
	cur_cat:'',
	cur_song_name:'',
	fly_notes_time:0,
	op_try_time:0,
	song_loader:new PIXI.Loader(),
	timer:0,
	on:false,
	time_left:5,
		
	activate(fp_id){
		
		this.activate_cat_menu();
		
	},
	
	activate_cat_menu(){
		
		objects.cat_choose_frame.visible=false;		
		
		my_choose=Math.random()>0.5;
		
		if (Math.random()>0.85)
			this.replace_some_player();
							
		//смотря кто выбирает
		if(my_choose){
			
			
			objects.cat_buttons_cont.alpha=1;
			objects.choose_cat_header.texture=gres.choose_cat_header.texture;			
		}else{
			objects.cat_buttons_cont.alpha=0.5;
			objects.choose_cat_header.texture=gres.op_choose_text.texture;		
			
		}

		
		anim2.add(objects.choose_cat_header,{scale_y:[0, 0.666]}, true, 0.5,'linear');
		anim2.add(objects.cat_buttons_cont,{x:[450, 0]}, true, 0.5,'linear');
						
		this.time_left=8;
		objects.time_left.text=this.time_left;
		this.timer=setInterval(game.time_tick.bind(game), 1000);
		
	},
	
	async replace_some_player(){
		
		const player_to_replace=[objects.player1,objects.player2][irnd(0,2)];
		search_menu.add_fp(player_to_replace);
	
	},
	
	time_tick(){
		
		if(return_tocken) return;
		
		this.time_left--;
		objects.time_left.text=this.time_left;
		const cat_list=['cat200x','cat201x','cat202x'];
		if(this.time_left===0) {
			this.select_cat(cat_list[irnd(0,cat_list.length-1)])			
		}
		
		//это выбирает фейковый игрок
		if (my_choose===false){
			if(this.time_left<3) {
				this.select_cat(cat_list[irnd(0,cat_list.length-1)])			
			}
		}
		
	},
	
	close(){
		
		search_menu.close();
		clearInterval(this.timer);
		objects.choose_cat_header.visible=false;
		objects.cat_buttons_cont.visible=false;
		objects.cat_choose_frame.visible=false;
		objects.big_record_cont.visible=false;
		objects.progress_bar.visible=false;
		
	},
	
	back_to_main_menu(){
		
		this.close();
		
		anim2.kill_anim(objects.player0);
		anim2.kill_anim(objects.player1);
		anim2.kill_anim(objects.player2);
		objects.player0.visible=false;
		objects.player1.visible=false;
		objects.player2.visible=false;
			

	},
			
	async close_cat_menu(){
		
		anim2.add(objects.choose_cat_header,{scale_y:[0.666, 0]}, false, 0.5,'linear');		
		await new Promise((resolve, reject) => setTimeout(resolve, 500));

		await anim2.add(objects.cat_buttons_cont,{x:[0, -450]}, false, 0.5,'linear');
		
	},
			
	cat_down(cat){		
		
		if(!my_choose)
			return;
		
		this.select_cat(cat);
		
	},
	
	async select_cat(cat){
		
		clearInterval(this.timer);
				
		if (objects.cat_choose_frame.visible===true)
			return;
				
		sound.play('click');
				
		this.cur_cat=cat;
		objects.cat_choose_frame.visible=true;
		objects.cat_choose_frame.x=objects[cat].x;
		objects.cat_choose_frame.y=objects[cat].y;
		
		await this.close_cat_menu();		
		
		this.song_index=irnd(0,songs_data[this.cur_cat].length);
		this.song_obj=songs_data[this.cur_cat][this.song_index];
		this.load_and_play();
		this.on=true;
	},
		
	check_song(){
						
		if(return_tocken || !this.on) return;
				
		if(this.cur_song_name.replace(/\s/g, '')===l_board.get_song_name()){						
			objects.player0.show_try_icon(true);
			this.stop_song('MY_WIN');
			this.update_rating(objects.player0);

		}else{
			l_board.clear();
			sound.play('wrong');
			objects.player0.show_try_icon(false);
		}
		
	},
	
	add_flying_notes(){
		
		if (Date.now()>this.fly_notes_time+500){
			const fly_note = objects.fly_notes.find(element => { return element.visible ===false});
					
			if(fly_note){
				const rot=Math.random()*2 * Math.PI;
				const dx=Math.sin(rot);
				const dy=Math.cos(rot);
				fly_note.tint=Math.random() * 0xFFFFFF;
				fly_note.texture=gres['fly'+irnd(0,3)].texture;
				anim2.add(fly_note,{x:[dx*100, dx*200],y:[dy*100,dy*200],scale_xy:[0.5,1.2],alpha:[1,0]}, false, 2,'easeOutCubic');					
			}	
			this.fly_notes_time=Date.now();
		}
		
	},
	
	update_rating(winner){
		
		
		if(winner===objects.player0){
			objects.player0.update_my_rating(1);
			objects.player1.update_fp_rating(-1);
			objects.player2.update_fp_rating(-1);
		}
		
		if(winner===objects.player1){
			objects.player0.update_my_rating(-1);
			objects.player1.update_fp_rating(1);
			objects.player2.update_fp_rating(-1);
		}
		
		if(winner===objects.player2){
			objects.player0.update_my_rating(-1);
			objects.player1.update_fp_rating(-1);
			objects.player2.update_fp_rating(1);
		}
		
	},
	
	process(){		
	
		const ops=[objects.player1,objects.player2];
		const t=Date.now();
		
		//обрабатываем соперников
		for(const p of ops){
			
			if(t>p.next_try_time && this.on){
				const res=p.make_a_try(this.cur_song_name);			
				if(res){
					
					sound.play('opponent_win');
					this.update_rating(p);

					this.stop_song('MY_LOSE');
					return;				
				}else{
					sound.play('wrong');
				}
			}			
		}

		if(this.song_sound && this.song_sound.isPlaying) {
			
			//вращаем пластинку
			objects.big_record.rotation+=0.02;			
			
			//добавляем нотки для анимации
			this.add_flying_notes();		
			
		}
	
		
		objects.big_record_bcg.alpha=Math.abs(Math.sin(game_tick));	
		const sec_play=(Date.now()-this.play_start)*0.001;
		objects.progress_bar.width=450*(24-sec_play)/24;
		if(objects.progress_bar.width<=0.211)
			this.stop_song('NO_ANSWER');

	},
		
	async stop_song(res){
				
		some_process.game=function(){};
		
		if(this.song_sound && this.song_sound.isPlaying)
			this.song_sound.stop();
		this.on=false;
						
		anim2.add(objects.progress_bar,{x:[0, -450]}, false, 1,'linear');		
		anim2.add(objects.big_record_cont,{x:[objects.big_record_cont.sx,900]}, false, 1,'easeInBack');
		keyboard.close();
		
		objects.correct_artist.text=this.song_obj.artist;
		objects.correct_song.text=this.song_obj.song;
		anim2.add(objects.correct_song_name_cont,{y:[100,0]}, true, 0.5,'easeOutBack');
		
		//показываем рекламу
		ad.show();
		
		if(res==='MY_WIN'){
			
			sound.play('applause');		
			await anim2.add(objects.hand,{x:[900,objects.hand.sx],rotation:[1.5,0]}, true, 0.5,'easeOutBack');
			await new Promise((resolve, reject) => setTimeout(resolve, 1000));
			await anim2.add(objects.hand,{x:[objects.hand.sx,-900]}, false, 0.5,'easeInBack');
				
		}
		
		if(res==='MY_LOSE'){
			
			await new Promise((resolve, reject) => setTimeout(resolve, 2500));
				
		}
				
		if(res==='NO_ANSWER'){
			
			await new Promise((resolve, reject) => setTimeout(resolve, 1500));
			
		}		
		
		
		
		anim2.add(objects.correct_song_name_cont,{y:[0,100]}, false, 0.5,'easeInBack');
		
		

		
		if(return_tocken) return;		
		
		this.activate_cat_menu();
		
	},
	
	record_down(){
		
		if(this.song_sound && !this.song_sound.isPlaying && this.on){
			this.song_instance=sound.play('song',game.song_loader);	
			//this.song_instance.on('end',function(){});
		}		
		
	},
	
	async song_play_end(){
		
		if(return_tocken)return;
		
		//подсказка что можно нажать для продолжения
		await anim2.add(objects.hand0,{x:[-200, objects.hand0.sx]}, true, 0.5,'linear');
		await new Promise(resolve => setTimeout(resolve, 500));
		objects.hand0.texture=gres.hand1.texture;
		await new Promise((resolve, reject) => setTimeout(resolve, 500));
		objects.hand0.texture=gres.hand0.texture;
		await new Promise((resolve, reject) => setTimeout(resolve, 500));
		anim2.add(objects.hand0,{x:[objects.hand0.x,-200]}, true, 0.5,'linear');
	},
		
	async load_and_play(){
		
		this.song_loader.destroy();
		this.song_loader.add('song', git_src+"/songs/"+this.cur_cat+"/"+this.song_index+".mp3",{timeout: 5000});	
		this.cur_song_name=songs_data[this.cur_cat][this.song_index].song.toUpperCase();
		await new Promise((resolve, reject)=> game.song_loader.load(resolve));
		if(return_tocken) return;

		//подсказка категории
		objects.cat_hint.text={'cat197x':'197x год','cat198x':'198x год','cat199x':'199x год','cat200x':'200x год','cat201x':'201x год','cat202x':'202x год'}[this.cur_cat];
		anim2.add(objects.cat_hint,{x:[-100, objects.cat_hint.sx]}, false, 8,'easeBridge');
		
		//проверяем что нормально загрузилось
		try {
			this.song_sound=game.song_loader.resources.song.sound;
			if(this.song_sound.duration<1){alert('Ошибка')}
		} catch (error) {
			alert('Ошибка');
		}
		
		this.on=true;
		
		this.song_instance=this.song_sound.play();
		this.song_instance.on('end',function(){game.song_play_end()});
		some_process.game=this.process.bind(game);
		this.play_start=Date.now();
		this.fly_notes_time=Date.now()+1000;
		
		objects.player1.init_try_time(this.cur_song_name);
		objects.player2.init_try_time(this.cur_song_name);
		
		//размещаем буквы
		objects.letters.forEach(l=>l.visible=false);
		
		//считаем длину
		l_board.init(this.cur_song_name);
		
		
		keyboard.open();
		anim2.add(objects.big_record_cont,{x:[-450, objects.big_record_cont.sx]}, true, 1,'easeOutBack');
		anim2.add(objects.close_game,{x:[450, objects.close_game.sx]}, true, 1,'easeOutBack');
		
		objects.progress_bar.x=0;
		anim2.add(objects.progress_bar,{alpha:[0, 1]}, true, 1,'linear');
		
		objects.progress_bar.width=450;
	}
	
	
}

