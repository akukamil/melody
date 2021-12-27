﻿let midi_songs={0:["#2Маши","Босая",2017],1:["Adele","Hello",2015],2:["Adele","Rolling In The Deep",2011],3:["Adele","Rolling In The Deep",2011],4:["Alekseev","Океанами Стали",2016],5:["Alekseev","Пьяное солнце",2016],6:["Ariana Grande","7Rings",2019],7:["Ariana Grande","into you",2016],8:["Ariana Grande","One Last Time",2014],9:["Artik & Asti","Девочка Танцуй",2020],10:["Artik & Asti","Истеричка",2021],11:["Ava Max","So Am I",2020],12:["Ava Max","Sweet But Psyco",2020],13:["Bebe Rexha","I Got You",2018],14:["Bruno Mars","Grenade",2010],15:["Charlie Puth","Attention",2018],16:["Dabro","На часах ноль ноль",2021],17:["Dabro","Услышит Весь Район",2021],18:["Dabro","Юность",2020],19:["Doja Cat","Say So",2019],20:["Dotan","Numb",2019],21:["Dua Lipa","Break My Heart",2020],22:["Dua Lipa","Don't Start Now",2019],23:["Dua Lipa","Physical",2020],24:["Ed Sheeran","Afterglow",2020],25:["Ed Sheeran","Bad Habits",2021],26:["Ed Sheeran","Shape of You",2017],27:["Foushee","Deep End",2020],28:["Imagine Dragons","Believer",2017],29:["Inna","Flashbacks",2020],30:["Jason Derulo","it girl",2011],31:["Jason Derulo","Take You Dancing",2020],32:["Jonas Brothers","Sucker",2019],33:["Jony","Комета",2019],34:["Katy Perry","Hot N Cold",2008],35:["Katy Perry","I Kissed A Girl",2008],36:["Kazka","Плакала",2018],37:["Maroon 5","Animals",2014],38:["Maroon 5","She Will Be Loved",2002],39:["Mary Gu","Косички",2021],40:["Meghan Trainor","All About That Bass",2015],41:["Mozgi","Zavtra",2021],42:["Niletto","Любимка",2019],43:["Rita Ora","Anywhere",2017],44:["Rita Ora","I Will Never Let You...",2014],45:["Rita Ora","Let You Love Me",2018],46:["Sam Smith","Stay With Me",2014],47:["Sia","Cheap Thrills",2016],48:["Sia","Unstoppable",2016],49:["The Weeknd","Blinding Lights",2020],50:["The Weeknd","Save Your Tears",2020],51:["Tones And I "," Dance Monkey",2019],52:["Twenty One Pilots","Stressed Out",2015],53:["Years and Years","King",2015],54:["Years and Years","Shine",2015],55:["Zivert","Credo",2019],56:["Zivert","Life",2019],57:["Zivert","Тебе",2021],58:["Ани Лорак","Наполовину",2021],59:["Артур Пирожков","Зацепила",2019],60:["Баста","Сансара",2017],61:["Вера Брежнева","Розовый дым",2021],62:["Время и Стекло","Имя 505",2017],63:["Джарахов","Бегу По Кругу",2021],64:["Дима Билан","На Берегу Неба",2004],65:["Дима Билан","Не молчи",2015],66:["Дима Билан","Это была любовь",2006],67:["Егор Крид","Мне Нравится",2016],68:["Егор Крид","Потрачу",2017],69:["Егор Крид","Слеза",2017],70:["Елка","Около тебя",2014],71:["Елка","Ты Моя Звезда",2021],72:["Клава Кока","Ла Ла Ла",2021],73:["Лобода","Алло",2021],74:["Лобода","Новый Рим",2019],75:["Лобода","Родной",2021],76:["Лобода","Твои Глаза",2016],77:["Макс Барских","Лей Не Жалей",2020],78:["Макс Барских","Туманы",2016],79:["Мичелз","Хоть Убей",2021],80:["Мот","Август Это Ты",2021],81:["Мот","Капкан",2016],82:["Мэвл","Холодок",2019],83:["Сергей Лазарев ","Лови",2019],84:["Сергей Лазарев","В Самое Сердце",2015],85:["Сергей Лазарев","Шепотом",2017],86:["Серебро","Мало Тебя",2016],87:["Серебро","Между Нами Любовь",2017],88:["Серебро","Отпусти Меня",2015],89:["Хабиб","Ягодка Малинка",2020],90:["Валерий Меладзе","Красиво",2002],91:["Валерий Меладзе","Небеса",2010],92:["Kwabs","Walk",2015],93:["The Weeknd","Cant Feel My Face",2015],94:["Лобода","Пуля-Дура",2019],95:["Rihanna","Diamonds",2012],96:["Ханна","Омар Хаям",2018],97:["Дима Билан","Она Моя",2020],98:["Максим","Спасибо",2021],99:["Avicii","Wake Me Up",2013],100:["BTS","Dynamite",2020],101:["OneRepublic","If I Lose Myself",2013],102:["Dean Lewis","Be Alright",2018],103:["Юлия Савичева","Сияй",2021],104:["Hozier","Take Me To Church",2014],105:["Imagine Dragons","Thunder",2017],106:["Потап и Настя","Чумачечая Весна",2014],107:["IOWA","Маршрутка",2014],108:["Elvira T","Все Решено",2013],109:["Серебро","Перепутала",2015],110:["Dan Balan","Лишь До Утра",2012],111:["Алексей Воробьев","Я Тебя Люблю",2017],112:["John Legend","All Of Me",2013],113:["Shakira","Try Everything",2016],114:["Bruno Mars","It Will Rain",2011],115:["One Direction","Drag Me Down",2015],116:["Carly Rae Jepsen","I Really Like You",2015],117:["Максим","Золотыми Рыбками",2015],118:["Потап и Настя","Бумдиггибай",2015],119:["Ваня Дмитриенко","Венера-Юпитер",2021],120:["HammAli & Navai","Прятки",2019],121:["Artik & Asti","Под Гипнозом",2019],122:["OneRepublic","Counting Stars",2013],123:["Miley Cyrus","Wrecking Ball",2013],124:["Pink","Try",2012],125:["Flo Rida","Whistle",2012],126:["Artik & Asti","Грустный Дэнс",2019],127:["Люся Чеботина","Солнце Монако",2021],128:["Taylor Swift","Shake It Off",2014],129:["Hurts","Redemption",2020],130:["Юлианна Кара...","Внеорбитные",2017],131:["John Newman","Love Me Again",2013],132:["Taylor Swift","Blank Space",2014],133:["Shakira & Rihanna","Cant Remember To..",2014],134:["Fifth Harmony","Work",2016],135:["DEAD BLONDE","Мальчик на девятке",2020],136:["Alan Walker","Faded",2015],137:["The Weeknd","The Hills",2015],138:["Ava Max","Salt",2020],139:["Zivert","ЯТЛ",2020],140:["Nessa Barrett","La Di Die",2021],141:["Alvaro Soler","La Cintura",2019],142:["Miley Cyrus","We Cant Stop",2013],143:["Camila Cabello...","Senorita",2019],144:["Винтаж","Роман",2011],145:["Мумий тролль...","Башня",2021],146:["Вера Брежнева","Доброе утро",2014],147:["Alan Walker","Alone",2016],148:["Султан Лагучев","Горький вкус",2021],149:["Дора","Втюрилась",2020],150:["Minelli","Rampampam",2021],151:["GAYAZOV$ BRO..","Малиновая лада",2021],152:["Adele","Set Fire To the..",2011],153:["Елка","Прованс",2014],154:["Loreen","Euphoria",2012],155:["David Guetta & Sia","Titanium",2012],156:["Aura Dione","Friends",2011],157:["The Wanted","Chasing the Sun",2012],158:["Kelly Clarkson","Stronger",2011],159:["Lady Gaga","Bad Romance",2009],160:["Валерия","Капелькою",2015],161:["Adam Lambert","Whataya Want..",2009],162:["Lorde","Team",2013]};



























