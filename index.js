var M_WIDTH = 450, M_HEIGHT = 800, game_platform='', app ={stage:{},renderer:{}}, gres, objects = {}, my_data = {}, game_tick = 0, state ="",git_src='';
var some_process = {}, my_choose=false,fbs, hidden_state_start=0, players_cache={};

const room_to_path={room1:'songs/ru',room2:'songs/en'}
const room_to_lang={room1:'ru',room2:'en'};

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
	
	any_on() {
		
		for (let s of this.slot)
			if (s !== null)
				return true
		return false;		
	},
	
	linear(x) {
		return x
	},
	
	kill_all(){
		
		for (var i = 0; i < this.slot.length; i++){
			if (this.slot[i] !== null) {
				let s=this.slot[i];
				s.obj.ready=true;					
				s.p_resolve('OK');
				this.slot[i]=null;
			}
		}
		
	},
	
	kill_anim(obj) {
		
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
	
	easeOutBack(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutElastic(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	
	easeOutSine(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad(x) {
		return x * x;
	},
	
	easeOutBounce(x) {
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
	
	easeInCubic(x) {
		return x * x * x;
	},
	
	ease2back(x) {
		return Math.sin(x*Math.PI*2);
	},
	
	easeInOutCubic(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	easeBridge(x){
		
		if(x<0.154)
			return 1.2-Math.pow(x*10-1.095445,2);
		if(x>0.845)
			return 1.2-Math.pow((1-x)*10-1.095445,2);
		return 1		
	},
		
	shake(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
		
	},	
	
	long_blink(x){
		
		return Math.abs(Math.sin(x*9.4248));
		
	},
		
	add(obj, params, vis_on_end, time, func) {
				
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
	
	add_waiter(time){
		
		this.add(this.empty_spr,{x:[0,1]},false,time,'linear');
		
	},
	
	
	process () {
		
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
		this.bcg.width=410;
		this.bcg.height=70;
						
		this.place=new PIXI.BitmapText("1", {fontName: 'mfont', fontSize: 28});
		this.place.x=20;
		this.place.y=20;
		this.place.tint=0xffffff;
		
		this.avatar=new PIXI.Sprite();
		this.avatar.x=40;
		this.avatar.y=10;
		this.avatar.width=this.avatar.height=48;
				
		this.name=new PIXI.BitmapText(' ', {fontName: 'mfont', fontSize: 25});
		this.name.x=100;
		this.name.y=20;
		this.name.tint=0xffffff;
		
	
		this.record=new PIXI.BitmapText(' ', {fontName: 'mfont', fontSize: 25});
		this.record.x=367;
		this.record.tint=0xffff00;
		this.record.y=35;		
		this.record.anchor.set(0.5,0.5);
		
		this.addChild(this.bcg,this.place, this.avatar, this.name, this.record);		
	}
	
	
}

class player_card_class extends PIXI.Container {
		
	constructor(x,y) {
		
		super();
		
		this.stat=0;
		this.place=0;
		this.uid=0;
		
		this.bcg=new PIXI.Sprite(gres.player_card_bcg.texture);
		this.bcg.width=this.bcg.height=90;
		this.bcg.x=this.bcg.y=-10;
		
		this.avatar_mask=new PIXI.Sprite(gres.avatar_mask.texture);
		this.avatar_mask.width=this.avatar_mask.height=90;
		this.avatar_mask.x=this.avatar_mask.y=-10;	
		
		this.avatar=new PIXI.Sprite();
		this.avatar.width=this.avatar.height=70;		
		
		this.avatar.mask=this.avatar_mask;

		this.stat_bcg=new PIXI.Sprite(gres.player_card_stat_bcg.texture);
		this.stat_bcg.width=60;
		this.stat_bcg.height=60;
		this.stat_bcg.x=30;
		this.stat_bcg.y=30;
		
		this.t_stat=new PIXI.BitmapText('0', {fontName: 'mfont', fontSize :22, align: 'center'});
		this.t_stat.x=60;
		this.t_stat.y=60;
		this.t_stat.tint=0x000000;
		this.t_stat.anchor.set(0.5,0.5);		
				
		this.frame=new PIXI.Sprite(gres.player_card_frame.texture);
		this.frame.width=this.frame.height=90;
		this.frame.x=this.frame.y=-10;

		this.name=new PIXI.BitmapText('', {fontName: 'mfont', fontSize :30, align: 'center'});
		this.name.anchor.set(0.5,0.5);
		this.name.x=35;
		this.name.y=90;
		this.name.tint=0xFFFF00;
		
		this.visible=false;
				
		this.addChild(this.bcg,this.avatar,this.avatar_mask,this.frame,this.name,this.stat_bcg, this.t_stat);
		
	}	
	
	set_stat(p){		
		this.cacheAsBitmap=false;
		this.stat=p;
		this.t_stat.text=p;
		this.cacheAsBitmap=true;
	}
	
	change_place(place,fast){
		
		this.place=place;
		if(fast)
			this.x=place*90+10
		else
			anim2.add(this,{x:[this.x, place*90+10]}, true, 0.25,'linear');			
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

class chat_record_class extends PIXI.Container {
	
	constructor() {
		
		super();
		
		this.correct_bcg=new PIXI.Sprite(gres.correct_bcg.texture);
		this.correct_bcg.scale_xy=0.45;
		this.correct_bcg.x=-10;
		this.correct_bcg.y=-3;
		
		this.text=new PIXI.BitmapText('Николай: хорошая игра', {lineSpacing:50,fontName: 'mfont',fontSize:27}); 
		this.text.tint=0xFFFF00;
		
		this.name_text=new PIXI.BitmapText('Николай:', {fontName: 'mfont',fontSize: 27}); 
		this.name_text.tint=0xFFFFFF;
				
		this.addChild(this.correct_bcg,this.text,this.name_text)
		
	}
	
	set(name, text,color_name,color_text,is_correct){
		
		this.correct_bcg.visible=is_correct;
		
		this.text.text=name+': '+text;
		this.name_text.text=name+':';
		
		this.text.tint=color_text||0xFFFFFF;
		this.name_text.tint=color_name||0xFFFFFF;	
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
	//x,y,x2,y2
	ru_keys :[[23,124,70,164,'<'],[23,30,53.58,70,'Й'],[60.58,30,91.16,70,'Ц'],[98.17,30,128.75,70,'У'],[135.75,30,166.33,70,'К'],[173.33,30,203.91,70,'Е'],[210.92,30,241.5,70,'Н'],[248.5,30,279.08,70,'Г'],[286.08,30,316.66,70,'Ш'],[323.67,30,354.25,70,'Щ'],[361.25,30,391.83,70,'З'],[398.83,30,429.41,70,'Х'],[436.42,30,467,70,'Ъ'],[23,77,57,117,'Ф'],[64,77,98,117,'Ы'],[105,77,139,117,'В'],[146,77,180,117,'А'],[187,77,221,117,'П'],[228,77,262,117,'Р'],[269,77,303,117,'О'],[310,77,344,117,'Л'],[351,77,385,117,'Д'],[392,77,426,117,'Ж'],[433,77,467,117,'Э'],[77,124,108.11,164,'Я'],[115.11,124,146.22,164,'Ч'],[153.22,124,184.33,164,'С'],[191.33,124,222.44,164,'М'],[229.44,124,260.55,164,'И'],[267.56,124,298.67,164,'Т'],[305.67,124,336.78,164,'Ь'],[343.78,124,374.89,164,'Б'],[381.89,124,413,164,'Ю'],[420,124,467,164,'OK'],[140,171,350,211,' ']],
	en_keys:[[24,124,71,164,'<'],[23,30,61.1,70,'Q'],[68.1,30,106.2,70,'W'],[113.2,30,151.3,70,'E'],[158.3,30,196.4,70,'R'],[203.4,30,241.5,70,'T'],[248.5,30,286.6,70,'Y'],[293.6,30,331.7,70,'U'],[338.7,30,376.8,70,'I'],[383.8,30,421.9,70,'O'],[428.9,30,467,70,'P'],[45,77,83.22,117,'A'],[90.22,77,128.44,117,'S'],[135.44,77,173.66,117,'D'],[180.67,77,218.89,117,'F'],[225.89,77,264.11,117,'G'],[271.11,77,309.33,117,'H'],[316.33,77,354.55,117,'J'],[361.56,77,399.78,117,'K'],[406.78,77,445,117,'L'],[78,124,119.71,164,'Z'],[126.71,124,168.42,164,'X'],[175.43,124,217.14,164,'C'],[224.14,124,265.85,164,'V'],[272.86,124,314.57,164,'B'],[321.57,124,363.28,164,'N'],[370.29,124,412,164,'M'],[419,124,466,164,'OK'],[140,171,360,211,' ']],
	keys_data:null,
	
	open(){		
		
		const lang_to_texture={ru:gres.keyboard_ru.texture,en:gres.keyboard_en.texture}
		const lang_to_keys={ru:this.ru_keys,en:this.en_keys}
		
		const lang=room_to_lang[game.room]
		
		objects.keyboard.texture=lang_to_texture[lang];
		
		this.keys_data=lang_to_keys[lang];
		
		anim2.add(objects.keyboard_cont,{y:[950, objects.keyboard_cont.sy]}, true, 1,'linear');
		
	},
		
	close(){
		
		anim2.add(objects.keyboard_cont,{y:[objects.keyboard_cont.y,950]}, false, 1,'linear');
		
	},
		
	keydown(key){				
		
		//*******это нажатие с клавиатуры
		key = key.toUpperCase();
		sound.play('keypress');
				
		if(key==='BACKSPACE') key ='<';
		if(key==='ENTER') key ='OK';
			
		var key2 = this.keys_data.find(k => {return k[4] === key})			
				
		this.process_key(key2)
		
	},
	
	get_key_from_touch(e){
		
		//координаты нажатия в плостоки спрайта клавиатуры
		let mx = e.data.global.x/app.stage.scale.x - objects.keyboard.x;
		let my = e.data.global.y/app.stage.scale.y - objects.keyboard.y;
				
		//ищем попадание нажатия на кнопку
		let margin = 5;
		for (let k of this.keys_data)	
			if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin)
				return k;
		return null;
		
	},
		
	pointerdown(e, inp_key){
		
		if (!game.on) return;
		
		//звук нажатой клавиши
		sound.play('keypress');
		
		//получаем значение на которое нажали
		const key=this.get_key_from_touch(e);
		
		//дальнейшая обработка нажатой команды
		this.process_key(key);		

	},
	
	highlight_key(key_data){
		
		const [x,y,x2,y2,key]=key_data
		
		//подсвечиваем клавишу
		objects.hl_key.width=x2-x;
		objects.hl_key.height=y2-y;
		
		objects.hl_key.x = x+objects.keyboard.x;
		objects.hl_key.y = y+objects.keyboard.y;	
		
		anim2.add(objects.hl_key,{alpha:[1, 0]}, false, 0.5,'linear');
		
	},
	
	process_key(key_data){

		if(!key_data) return;
		
		if (objects.keyboard_text.text.length>40) return;
		
		const key=key_data[4];
		
		//подсвечиваем...
		this.highlight_key(key_data);
		
		if(key==='<'){			
			objects.keyboard_text.text=objects.keyboard_text.text.slice(0, -1);
			return;
		}
		
		if(key==='OK'){			
		
			if (objects.keyboard_text.text.length>2)
				game.send_song_for_checking(objects.keyboard_text.text);			
			objects.keyboard_text.text=''
			return;
		}		

		//добавляем значение к слову
		objects.keyboard_text.text+=key;
		
	}
		
}

ad={
			
	async show() {
				
				
		messages.add('Админ','Рекламная пауза!')
		await new Promise(resolve => setTimeout(resolve, 1000));
		
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
	
	if (document.hidden===true)
		game.mute_song();
		
	
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

lb={
	
	add_game_to_vk_menu_shown:0,
	prv_update:0,
	
	activate: function() {

		anim2.add(objects.lb_cards_cont,{x:[450, 0]}, true, 0.3,'linear');
		
		objects.lb_cards_cont.visible=true;
		objects.lb_back_button.visible=true;
		
						
		anim2.add(objects.lb_1_cont,{x:[450,objects.lb_1_cont.sx]}, true, 0.3,'linear');
		anim2.add(objects.lb_2_cont,{x:[450,objects.lb_2_cont.sx]}, true, 0.3,'linear');
		anim2.add(objects.lb_3_cont,{x:[450,objects.lb_3_cont.sx]}, true, 0.3,'linear');
		
		for (let i=0;i<7;i++) {			
			objects.lb_cards[i].x=20;
			objects.lb_cards[i].y=280+i*59;	
			objects.lb_cards[i].place.text=(i+4)+".";			
		}	
		
		

		//не обновляем слишком рано
		if (Date.now()<this.prv_update+100000)
			return;
		
		this.update();		
	},
	
	close() {
							
			
		objects.lb_back_button.visible=false;
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
	
	back_button_down() {
		
		if (objects.lb_1_cont.ready===false) {
			game_res.resources.locked.sound.play();
			return
		};		
		
		game_res.resources.click.sound.play();
		
		this.close();
		main_menu.activate();
		
	},
	
	async load_and_set_avatar(tar_obj,pic_url,index){
				
		if (index<3)
			tar_obj.parent.cacheAsBitmap=false;
		
		//меняем адрес который невозможно загрузить
		if (pic_url==='https://vk.com/images/camera_100.png')
			pic_url = 'https://i.ibb.co/fpZ8tg2/vk.jpg';	
		
		let tex=await PIXI.Texture.fromURL(pic_url);
		tar_obj.texture=tex;
		if (index<3)
			tar_obj.parent.cacheAsBitmap=true;
	},
	
	async update(){

		let players=await fbs.ref('players').orderByChild('rating').limitToLast(25).once('value');
		players=players.val();
						
		objects.lb_1_cont.cacheAsBitmap  = false;
		objects.lb_2_cont.cacheAsBitmap  = false;
		objects.lb_3_cont.cacheAsBitmap  = false;	
		
		let  players_array = [];
		for (let [key, player] of Object.entries(players))
			if (key!=='undefined' && player.name)
				players_array.push([player.name, player.rating, player.pic_url]);	
		
		players_array.sort(function(a, b) {	return b[1] - a[1];});
				
						
		var len=Math.min(10,players_array.length);
		let tar_avatars=[];
		//загружаем тройку лучших
		for (let i=0;i<3;i++) {
			let p = players_array[i];
			if (p === undefined)
				break;
			
			make_text(objects['lb_'+(i+1)+'_name'],p[0],180);
								
			objects['lb_'+(i+1)+'_rating'].text = p[1];					
						
			let pic_url = p[2];
			tar_avatars.push([objects['lb_'+(i+1)+'_avatar'],p[2]]);

		};
		
		//загружаем остальных
		for (let i=3;i<10;i++) {
			
			let p = players_array[i];

			if (p === undefined)
				break;
			
			let fname=p[0];		
			
			make_text(objects.lb_cards[i-3].name,fname,200);
			
			objects.lb_cards[i-3].record.text=players_array[i][1]	
			tar_avatars.push([objects.lb_cards[i-3].avatar,players_array[i][2]]);
		};

		
		//загружаем аватарки
		for(let tar of tar_avatars)
			await this.load_and_set_avatar(tar[0],tar[1]);
	}
	
}

main_menu = {
		
	activate(new_player){
		
		if(new_player)
			anim2.add(objects.rules_pic,{x:[-450, objects.rules_pic.sx]}, true, 0.2,'easeOutBack');
		objects.main_menu_cont.visible=true;
		
		anim2.add(objects.title,{scale_x:[0,0.6666]}, true, 0.5,'easeOutBack');
		anim2.add(objects.play_russian,{x:[-450,objects.play_russian.sx]}, true, 0.5,'easeOutBack');	
		anim2.add(objects.play_other,{x:[450,objects.play_other.sx]}, true, 0.5,'easeOutBack');	
		objects.bcg.tint=0xffffff;
		
		some_process.main_menu=this.process.bind(this);
		
	},
	
	play_down(room) {

		if(!objects.main_menu_cont.ready)
			return;

		this.close();		
		game.activate(room);		
	},
	
	rules_button_down(){
		if(!objects.main_menu_cont.ready)
			return;
		anim2.add(objects.rules_pic,{x:[-450, objects.rules_pic.sx]}, true, 0.2,'easeOutBack');
	
	},
	
	rules_ok_down(){
		if(!objects.rules_pic.ready)
			return;
		anim2.add(objects.rules_pic,{x:[objects.rules_pic.x, 450]}, false, 0.2,'easeInBack');
	
	},
	
	lb_down(){

		this.close();
		lb.activate();
		
	},
	
	process(){
		if(objects.title.ready)
			objects.title.rotation=0.0+Math.sin(game_tick)*0.1;
		
	},
	
	close () {
		
		objects.main_menu_cont.visible=false;
	}
	
}

messages={
	
	on:false,
	bottom:565,
	cont_total_shift:0,
	
	add(name,text,is_correct){
		
		let color_name=0xffffff;
		let color_text=0xffff00;
		
		if (name==='Админ'){
			color_name=0xffddff;
			color_text=0xffdd99;
		}
		
		const oldest=this.get_old_message();
		oldest.y=this.bottom;
		oldest.set(name,text,color_name,color_text,is_correct||0);
		oldest.visible=true;
		this.bottom+=25;
		this.cont_total_shift-=25;
		anim2.add(objects.messages_cont,{y:[objects.messages_cont.y, this.cont_total_shift]}, true, 0.15,'linear');
		
	},
	
	get_old_message(){
		
		const res=objects.messages.find(msg => msg.visible===false);
		if(res) return res;
		
		return objects.messages.reduce((oldest, msg) => {
			return oldest.y < msg.y ? oldest : msg;
		});		
	}
		
}

game = {
	
	song_instance:0,
	song_sound:null,
	song_index:0,
	song_part:0,
	song_name:'',
	song_obj:{},
	play_start:0,
	fly_notes_time:0,
	song_loader:new PIXI.Loader(),
	on:false,
	state:'',
	room:'room1',
	songs:{},
	cur_rating:0,
	last_stat_data:0,
	started:false,
	skip_first_event:true,
	keep_alive_timer:0,
	
	new_song_event:null,
	timeout_event:null,
	winner_found_event:null,
	
	async update_songs(room){
		
		const lang=room_to_lang[room];
		
		if (this.songs?.[lang])
			return;
		
		let data=await fbs.ref(room_to_path[room]).once('value');
		if(!data){
			alert('Не получилось загрузить песни!!!')
			return;			
		}
		
		data=data.val();
		if(data.length<100){
			alert('Неправильный список песен!!!')
			return;			
		}
		
		this.songs[lang]=data;
		
	},
			
	async activate(room){
		
		this.room=room;
		
		await this.update_songs(room);		
		
		objects.wait_game_start.visible=true;
		anim2.add(objects.big_record_cont,{x:[-300, objects.big_record_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.avatars_cont,{y:[-100, objects.avatars_cont.sy]}, true, 0.5,'easeOutBack');
		anim2.add(objects.t_players_online,{x:[500, objects.t_players_online.sx]}, true, 0.5,'easeOutBack');
		
		objects.bcg.tint=0x449977;
		
		//убираем сообщения
		objects.messages.forEach(m=>m.visible=false);
		
		//начинаем прослушку событий
		let skip1=true;
		fbs.ref(this.room+'/server_info').on('value',data=>{	
			const inc_data=data.val();	
			
			if (skip1){
				skip1=false;
				return;
			}
					
			if (document.hidden)
				return;					

			if (inc_data.type==='new_song')
				this.new_song_event=[inc_data.song_index,inc_data.part];
			if (inc_data.type==='timeout')
				this.timeout_event=1;		
			if (inc_data.type==='song')
				game.song_variant_event(inc_data.uid,inc_data.song,inc_data.winner);	
			if (inc_data.type==='ad_break')
				ad.show();
			if (inc_data.type==='stat'){
				console.log(inc_data.data)
				this.recalc_places(inc_data.data);
			}

		});
					
		//обновление онлайн игроков
		fbs.ref(this.room+'/players').on('value',snapshot=>{			
			game.players_updated(snapshot.val());		
		})
		
		//добавляем мои данные в базу данных
		this.keep_alive_timer=setInterval(game.keep_me_alive.bind(game),30000);		
		this.keep_me_alive();
		
		fbs.ref(this.room+'/players/'+my_data.uid).onDisconnect().remove();
				
		//начинаем процессинг
		this.process_wait_next_song(true);

	},
	
	keep_me_alive(){
		
		fbs.ref(this.room+'/players/'+my_data.uid).set(firebase.database.ServerValue.TIMESTAMP);
		
	},
		
	song_variant_event(uid,song,winner){
		
		console.log(uid,song,winner)
		if (winner) this.winner_found_event=uid;
		
		const is_correct=song===this.song_name;
		const name=players_cache[uid].name.substr(0,7);
		messages.add(name,song,is_correct)

	},
	
	clear_events(){
		
		this.new_song_event=null;
		this.timeout_event=null;
		this.winner_found_event=null;
		
	},	
	
	process_wait_next_song(init){
		
		if (init){
			this.clear_events();
			this.mute_song();
			this.state='wait_next_song';
			some_process.game=this.process_wait_next_song.bind(this);			
			console.log('Активирован процесс: process_wait_next_song');			
		}
		
		if (this.new_song_event!==null){
			this.song_index=this.new_song_event[0];
			this.song_part=this.new_song_event[1];
			const lang=room_to_lang[this.room];

			const[band,song]=this.songs[lang][this.song_index].split('-');
			this.song_name=song.toUpperCase().replace(/_/g, ' ');
			objects.band_name.text=band.replace(/_/g, ' ');
			if (Math.random()>0.8)
				anim2.add(objects.band_name,{alpha:[0,1]}, false, 5,'easeBridge');
			
			
			console.log('Занадана песня с индексом: ',this.song_index,this.song_name);			
			this.load_and_play();
			this.process_listening(1);			
			this.new_song_event=null;
		}
		
		if (objects.wait_game_start.visible){
			objects.wait_game_start.y=objects.wait_game_start.sy+Math.abs(Math.sin(game_tick*2))*20;	
		}
		
		
		//подсветка
		objects.big_record_bcg.alpha=Math.abs(Math.sin(game_tick));	
	
	},
	
	process_listening(init){
		
		if (init){
			this.state='listening';
			this.clear_events();
			console.log('Активирован процесс: process_listening');
			some_process.game=this.process_listening.bind(this);
		}
					
		//вращаем пластинку
		objects.big_record.rotation+=0.02;			
		
		//добавляем нотки для анимации
		this.add_flying_notes();	
			

		objects.big_record_bcg.alpha=Math.abs(Math.sin(game_tick));	
		const sec_play=(Date.now()-this.play_start)*0.001;
		const b_width=450*(24-sec_play)/24;
		objects.progress_bar.width=b_width;		
		
		if (this.timeout_event){

			sound.play('timeout');
			messages.add('Админ','Никто не угадал!',0,0x5555ff)
			console.log('timeout');
			this.process_wait_next_song(1);
			this.timeout_event=null;
			
			
		}
		
		if (this.winner_found_event){	

			if (this.winner_found_event===my_data.uid){				
				sound.play('applause');	
				anim2.add(objects.hand,{x:[450, objects.hand.sx]}, false, 3,'easeBridge');
				console.log('Вы угадали правильно');
			}else{
				sound.play('op_win');			
			}
		
			this.process_wait_next_song(1);
			this.winner_found_event=null;
		}
		
		
		
	},
			
	async update_players_cache_data(uid){
		if (players_cache[uid]){
			if (!players_cache[uid].name){
				let t=await fbs.ref('players/' + uid + '/name').once('value');
				players_cache[uid].name=t.val()||'***';
			}
							
			if (!players_cache[uid].pic_url){
				let t=await fbs.ref('players/' + uid + '/pic_url').once('value');
				players_cache[uid].pic_url=t.val()||null;
			}
			
		}else{
			
			players_cache[uid]={};
			let t=await fbs.ref('players/' + uid).once('value');
			t=t.val();
			players_cache[uid].name=t.name||'***';
			players_cache[uid].pic_url=t.pic_url||'';
		}		
	},
	
	async get_texture(pic_url) {
		
		if (!pic_url) PIXI.Texture.WHITE;
		
		//меняем адрес который невозможно загрузить
		if (pic_url==="https://vk.com/images/camera_100.png")
			pic_url = "https://i.ibb.co/fpZ8tg2/vk.jpg";	
				
		if (PIXI.utils.TextureCache[pic_url]===undefined || PIXI.utils.TextureCache[pic_url].width===1) {
					
			let loader=new PIXI.Loader();
			loader.add('pic', pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});			
			await new Promise((resolve, reject)=> loader.load(resolve))	
			return loader.resources.pic.texture||PIXI.Texture.WHITE;

		}		
		
		return PIXI.utils.TextureCache[pic_url];		
	},
		
	async load_avatar (params = {uid : 0, tar_obj : 0}) {		

	
		const pic_url=players_cache[params.uid].pic_url;
		const t=await this.get_texture(pic_url);
		params.tar_obj.parent.cacheAsBitmap=false;
		params.tar_obj.texture=t;	
		params.tar_obj.parent.cacheAsBitmap=true;
	},
	
	async players_updated(players){
		
		if(!players) return;
		console.log('players_updated:',players)
		uids=Object.keys(players);
		
		objects.t_players_online.text='Игроков\nонлайн: ' +uids.length;
		
		objects.pcards.forEach(c=>c.visible=false)
		let cnt=0;
		for (let uid of uids){
			
			await this.update_players_cache_data(uid);		
			const pcard=objects.pcards[cnt];			
			
			pcard.visible=true;
			pcard.uid=uid;
			pcard.place=this.last_stat_data[uid]||0;
			if (uid===my_data.uid)
				pcard.name.tint=0xFFFF00
			else
				pcard.name.tint=0xffffff
			
			make_text(pcard.name,players_cache[uid].name,75);
			this.load_avatar({uid:uid,tar_obj:pcard.avatar})
			cnt++;
			if(cnt===objects.pcards.length) return;
		}
		
		this.recalc_places(this.last_stat_data,1);
		
		
	
		
	},
	
	close(){
		
		
		fbs.ref(this.room+'/server_info').off();
		fbs.ref(this.room+'/players').off();
		if(this.song_sound && this.song_sound.isPlaying)
			this.song_sound.stop();
		this.on=false;
		this.started=false;
		this.events_on=false;
		clearInterval(this.keep_alive_timer);
		anim2.kill_anim(objects.messages_cont);
		objects.avatars_cont.visible=false;
		objects.wait_game_start.visible=false;
		objects.big_record_cont.visible=false;
		objects.progress_bar.visible=false;
		objects.close_game.visible=false;
		objects.hand.visible=false;
		objects.band_name.visible=false;
		objects.t_players_online.visible=false;
		objects.keyboard_cont.visible=false;
		objects.messages_cont.visible=false;
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
		
	send_song_for_checking(song){
						
		fbs.ref(this.room+'/players_listener').set({song:song,uid:my_data.uid,tm:Date.now()})
		
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
		
	mute_song(){
		
		if(this.song_sound && this.song_sound.isPlaying)
			this.song_sound.stop();
		
	},
		
	recalc_places(data,fast){

		data=data||{};
		
		
		//проверяем мой рекорд
		if (data[my_data.uid]){
			this.cur_rating=data[my_data.uid];
			if (data[my_data.uid]>my_data.rating){
				my_data.rating=data[my_data.uid];
				fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating);
				messages.add('Админ','Поздравляю с новым рекордом!')
			}
		}
		
		//сохраняем данные
		this.last_stat_data=data;
		
		let active_players=[];
				
		//сортируем по найденым очкам (по убывания очков)
		for (let pcard of objects.pcards){
			const stat=data[pcard.uid];
			if (stat)
				pcard.set_stat(stat);
			else
				pcard.set_stat(0);
						
			if (pcard.visible)
				active_players.push(pcard);				
		}


		active_players=active_players.sort((a,b) =>  b.stat - a.stat)
		
		for(let i=0;i<active_players.length;i++){
			
			const player=active_players[i];
					
			player.change_place(i,fast);	
			if(!fast)
				sound.play('whoosh');
		}
			
	},
		
	record_down(){
		
		if(this.song_sound && !this.song_sound.isPlaying && this.state==='listening'){
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
		
		
		const song_path='https://akukamil.github.io/melody/'+room_to_path[this.room]+'/'+this.song_index+'_'+this.song_part+'.mp3';
		
		this.song_loader.destroy();		
		this.song_loader.add('song', song_path,{timeout: 5000});	
		await new Promise(resolve=>game.song_loader.load(resolve));

		if (objects.wait_game_start.visible)
			objects.wait_game_start.visible=false;

		if (!objects.first_rules.shown){
			anim2.add(objects.first_rules,{y:[-500, objects.first_rules.sy],alpha:[0,1]}, false, 3.5,'easeBridge');			
			objects.first_rules.shown=1;
		}


		//проверяем что нормально загрузилось
		if(!this.song_loader.resources.song.sound){
			messages.add('Админ','Ошибка при загрузке мелодии!')
			return;
		}

		this.song_sound=game.song_loader.resources.song.sound;
		this.song_sound.loop=true;
		
		this.on=true;
		this.started=true;
		objects.keyboard_text.text='';
		this.song_sound.play();
		
		this.play_start=Date.now();
		this.fly_notes_time=Date.now()+1000;
		
		//подсказка
		if(this.cur_rating<8){
			
			const first_letter=this.song_name[0].toUpperCase()
			messages.add('Админ','Подсказка! Первая буква - '+first_letter)
		}
						
		keyboard.open();
		
		anim2.add(objects.close_game,{x:[450, objects.close_game.sx]}, true, 0.5,'easeOutBack');
		
		objects.progress_bar.x=0;
		anim2.add(objects.progress_bar,{alpha:[0, 1]}, true, 1,'linear');
		
		objects.progress_bar.scale_x=1;
		objects.progress_bar.width=450;
	}
	
	
}

function break_to_main_menu(){
	
	game.close();
	main_menu.activate();
	
	
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
	LANG = 0;
	
	

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
	
	
	//короткое образ
	fbs=firebase.database();
			
	await define_platform_and_language();
								
	document.getElementById("m_bar").outerHTML = "";
    document.getElementById("m_progress").outerHTML = "";
		
	//создаем приложение пикси и добавляем тень
	app.stage = new PIXI.Container();
	app.renderer = new PIXI.Renderer({width:M_WIDTH, height:M_HEIGHT,antialias:true});
	document.body.appendChild(app.renderer.view).style["boxShadow"] = "0 0 15px #000000";

    //запускаем главный цикл
    main_loop();

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
	await auth2.load_script(git_src+'/songs.txt');

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
			
	ad.prv_show = Date.now();
			
			
			
	//анимация лупы
	some_process.loup_anim=function() {
		objects.id_loup.x=20*Math.sin(game_tick*8)+90;
		objects.id_loup.y=20*Math.cos(game_tick*8)+110;
	}

	//получаем данные об игроке из социальных сетей
	await auth2.init();
		
	//устанавлием имя на карточки
	make_text(objects.id_name,my_data.name,150);

		
	//ждем пока загрузится аватар
	let loader=new PIXI.Loader();
	loader.add("my_avatar", my_data.pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});			
	await new Promise((resolve, reject)=> loader.load(resolve))
	
	objects.id_avatar.texture=loader.resources.my_avatar.texture;
	
	//получаем остальные данные об игроке
	let _other_data = await fbs.ref('players/' + my_data.uid).once('value');
	let other_data = _other_data.val();
	const new_player=(other_data===null||other_data===undefined);
	my_data.rating = (other_data && other_data.rating) || 0;
	my_data.games = (other_data && other_data.games) || 0;
	my_data.name = (other_data && other_data.name) || my_data.name;
		
	//устанавливаем рейтинг в попап
	objects.id_record.text=my_data.rating;

	//обновляем данные в файербейс так как могли поменяться имя или фото
	fbs.ref('players/'+my_data.uid).set({name:my_data.name, pic_url: my_data.pic_url, rating : my_data.rating, games : my_data.games, tm:firebase.database.ServerValue.TIMESTAMP});

	//устанавливаем мой статус в онлайн
	//set_state({state : 'o'});

	//это событие когда меняется видимость приложения
	document.addEventListener("visibilitychange", vis_change);

	//ждем и убираем попап
	//await new Promise((resolve, reject) => setTimeout(resolve, 1000));
	
	anim2.add(objects.id_cont,{y:[objects.id_cont.y, -200]}, false, 1,'easeInBack');
	
	some_process.loup_anim=function() {};
		
	main_menu.activate(new_player);
	

}

function load_resources() {
	
	
	//document.body.innerHTML = '<span style="color: yellow; font-size: 24px;">ИГРА БУДЕТ ДОСТУПНА ЧУТЬ ПОЗЖЕ</span>';
	//return;
	
	//PIXI.Loader.registerPlugin(PIXI.gif.AnimatedGIFLoader);
    game_res = new PIXI.Loader();
		
	//короткая ссылка на ресурсы
	gres=game_res.resources;
	
	git_src='https://akukamil.github.io/melody/'
	//git_src=''
	

	
	game_res.add("m2_font", git_src+"/fonts/Bahnschrift/font.fnt");

	game_res.add('op_correct',git_src+'sounds/op_correct.mp3');
	game_res.add('click',git_src+'sounds/click.mp3');
	game_res.add('close',git_src+'sounds/close.mp3');
	game_res.add('lose',git_src+'sounds/lose.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');
	game_res.add('applause',git_src+'sounds/applause.mp3');
	game_res.add('wrong',git_src+'sounds/wrong.mp3');
	game_res.add('timeout',git_src+'sounds/timeout.mp3');
	game_res.add('op_win',git_src+'sounds/op_win.mp3');
	game_res.add('keypress',git_src+'sounds/keypress.mp3');
	game_res.add('whoosh',git_src+'sounds/whoosh.mp3');
	
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




