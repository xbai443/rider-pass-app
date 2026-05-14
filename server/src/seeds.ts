export interface SeedEntry {
  name: string
  address: string
  lat: number
  lng: number
  entrance: string
  guardAttitude: 0 | 1 | 2 | 3
  elevatorAccess: boolean
  tips: string
  upVotes: number
  downVotes: number
}

const seeds: SeedEntry[] = [
  { name: '锦绣花园', address: '温州市鹿城区车站大道268号', lat: 28.0112, lng: 120.6723, entrance: '南门可进电动车，北门只走行人', guardAttitude: 1, elevatorAccess: true, tips: '高峰期南门排队，建议走西门（无人值守）', upVotes: 12, downVotes: 2 },
  { name: '万达广场写字楼', address: '温州市鹿城区锦绣路1069号', lat: 28.0056, lng: 120.6589, entrance: '地下停车场入口进，报送外卖即可', guardAttitude: 0, elevatorAccess: true, tips: 'B2 层有外卖专用停车区，电梯直达各楼层', upVotes: 20, downVotes: 1 },
  { name: '恒隆花园', address: '温州市鹿城区江滨西路388号', lat: 28.0215, lng: 120.6489, entrance: '仅北门可进，需登记身份证', guardAttitude: 2, elevatorAccess: false, tips: '物业不让外卖上楼，必须等顾客下来取，门口有外卖暂存架', upVotes: 31, downVotes: 0 },
  { name: '时代广场', address: '温州市鹿城区信河街88号', lat: 28.0158, lng: 120.6551, entrance: '大门直接进，不需要登记', guardAttitude: 0, elevatorAccess: true, tips: 'A 座电梯最快，C 座货梯经常坏', upVotes: 8, downVotes: 3 },
  { name: '南浦小区', address: '温州市鹿城区南浦路18号', lat: 27.9956, lng: 120.6682, entrance: '东门西门都能进，老小区无保安', guardAttitude: 0, elevatorAccess: true, tips: '楼栋没电梯，5楼以下还好，6楼以上建议让顾客下楼', upVotes: 15, downVotes: 1 },
  { name: '新城大厦', address: '温州市瓯海区温瑞大道568号', lat: 27.9892, lng: 120.6413, entrance: '正门登记进入', guardAttitude: 1, elevatorAccess: true, tips: '前台需要打电话确认后才放行，提前联系顾客', upVotes: 6, downVotes: 2 },
  { name: '翠微新村', address: '温州市鹿城区翠微大道100号', lat: 28.0312, lng: 120.6321, entrance: '无门禁，哪都能进', guardAttitude: 0, elevatorAccess: false, tips: '多层老小区无电梯，楼号牌模糊，建议白天送', upVotes: 22, downVotes: 0 },
  { name: '金茂府', address: '温州市鹿城区瓯江路299号', lat: 28.0389, lng: 120.6721, entrance: '正门保安很严，侧门偶尔能溜进去', guardAttitude: 3, elevatorAccess: true, tips: '高档小区，外卖一律不让进，提前电话让顾客来门口取', upVotes: 45, downVotes: 1 },
  { name: '学子家园', address: '温州市瓯海区茶山高教园区', lat: 27.9215, lng: 120.6823, entrance: '多个入口都开放', guardAttitude: 0, elevatorAccess: true, tips: '学生外卖居多，楼号清晰好找，地下车库可停放', upVotes: 10, downVotes: 0 },
  { name: '置信广场', address: '温州市鹿城区飞霞南路818号', lat: 28.0089, lng: 120.6612, entrance: '商场正门进入，写字楼需要刷卡', guardAttitude: 1, elevatorAccess: true, tips: '写字楼区域需从商场3楼穿过去，有指引牌', upVotes: 3, downVotes: 0 },
  { name: '银泰百货写字楼', address: '温州市鹿城区解放南路68号', lat: 28.0134, lng: 120.6567, entrance: '地下车库入口旁有外卖通道', guardAttitude: 0, elevatorAccess: true, tips: '外卖电梯在货梯区，和顾客电梯分开的，速度快', upVotes: 18, downVotes: 1 },
  { name: '汤家桥新村', address: '温州市龙湾区汤家桥路55号', lat: 27.9945, lng: 120.7123, entrance: '村口有保安亭，但一般不管', guardAttitude: 0, elevatorAccess: false, tips: '城中村改造小区，部分没电梯，门牌号有点乱', upVotes: 7, downVotes: 2 },
  { name: '伯爵山庄', address: '温州市鹿城区江滨东路156号', lat: 28.0245, lng: 120.6634, entrance: '大门保安严格盘问，需顾客打电话确认', guardAttitude: 3, elevatorAccess: true, tips: '别墅区，不允许外卖车进入，步行进去来回10分钟', upVotes: 38, downVotes: 0 },
  { name: '国贸大厦', address: '温州市鹿城区黎明西路1号', lat: 28.0098, lng: 120.6601, entrance: '大门直接进', guardAttitude: 0, elevatorAccess: true, tips: '老牌写字楼，电梯稍微慢点，但不用登记', upVotes: 4, downVotes: 0 },
  { name: '瓯江国际', address: '温州市鹿城区瓯江路1号', lat: 28.0356, lng: 120.6708, entrance: '外围可进，内部需刷卡', guardAttitude: 2, elevatorAccess: true, tips: 'A栋楼下有接餐台，不用上楼；B栋需要顾客刷卡', upVotes: 11, downVotes: 1 },
  { name: '东瓯智库', address: '温州市鹿城区学院中路268号', lat: 28.0178, lng: 120.6756, entrance: '园区入口可自由进出', guardAttitude: 0, elevatorAccess: true, tips: '有多栋写字楼，看清楚楼号再进，D栋在最里面', upVotes: 5, downVotes: 0 },
  { name: '金色家园', address: '温州市鹿城区双龙路199号', lat: 28.0023, lng: 120.6521, entrance: '南门北门都可进，北门离楼栋更近', guardAttitude: 1, elevatorAccess: true, tips: '送餐高峰保安会拦，低峰期不管', upVotes: 9, downVotes: 3 },
  { name: '大自然花园', address: '温州市龙湾区永宁西路88号', lat: 27.9823, lng: 120.7234, entrance: '正门保安有时拦有时不拦', guardAttitude: 1, elevatorAccess: true, tips: '小区超大，分ABCD四个区，看清楚地址再进', upVotes: 13, downVotes: 1 },
  { name: '首府壹号', address: '温州市鹿城区新城大道88号', lat: 28.0115, lng: 120.6834, entrance: '严格管控，需业主授权', guardAttitude: 3, elevatorAccess: true, tips: '高端小区，外卖小哥一律不让进，物业有专门的外卖接收点', upVotes: 28, downVotes: 0 },
  { name: '人才公寓', address: '温州市瓯海区东方南路100号', lat: 27.9756, lng: 120.6534, entrance: '刷卡进入，跟着别人进就行', guardAttitude: 0, elevatorAccess: true, tips: '年轻人多，一般都会下来取，不需要上楼', upVotes: 14, downVotes: 0 },
  { name: '世纪锦绣', address: '温州市鹿城区锦绣路1220号', lat: 28.0042, lng: 120.6618, entrance: '西门南门都开放，西门离主楼更近', guardAttitude: 1, elevatorAccess: true, tips: '新小区门禁系统完善，外卖扫脸登记后可进入', upVotes: 6, downVotes: 1 },
  { name: '龙湾万达广场', address: '温州市龙湾区永定路1188号', lat: 27.9689, lng: 120.7389, entrance: '商场南门进，写字楼在商场左侧', guardAttitude: 0, elevatorAccess: true, tips: '写字楼电梯在商场3楼连接处，容易迷路，问一下保安', upVotes: 8, downVotes: 2 },
  { name: '华鸿中央城', address: '温州市瓯海区娄桥街道古岸路288号', lat: 27.9723, lng: 120.6215, entrance: '北门直接进，不需要登记', guardAttitude: 0, elevatorAccess: true, tips: '瓯海区府旁新小区，楼栋多，1-12栋在南区', upVotes: 5, downVotes: 0 },
  { name: '中梁首府', address: '温州市鹿城区惠民路999号', lat: 28.0081, lng: 120.6889, entrance: '正门有门禁，需登记', guardAttitude: 2, elevatorAccess: true, tips: '高档小区，保安比较较真，外卖登记后押身份证可进', upVotes: 15, downVotes: 3 },
  { name: '新田园住宅区', address: '温州市鹿城区新田园路88号', lat: 28.0334, lng: 120.6934, entrance: '东门有保安，西门无人值守', guardAttitude: 1, elevatorAccess: true, tips: '东门高峰期保安查得严，走西门快递通道没人管', upVotes: 18, downVotes: 0 },
  { name: '万科·鹿城金域', address: '温州市鹿城区江滨东路588号', lat: 28.0267, lng: 120.6678, entrance: '南门刷脸进入，外卖走侧门', guardAttitude: 1, elevatorAccess: true, tips: '万科物业管理规范，有外卖专用通道和临时停放区', upVotes: 11, downVotes: 1 },
  { name: '锦东家园', address: '温州市鹿城区锦江路68号', lat: 28.0011, lng: 120.6756, entrance: '北门开放，东门关闭', guardAttitude: 0, elevatorAccess: true, tips: '老小区改造后门禁已失效，自由进出', upVotes: 3, downVotes: 0 },
  { name: '德信·碧桂园', address: '温州市龙湾区永强东路200号', lat: 27.9589, lng: 120.7523, entrance: '北门登记可进', guardAttitude: 1, elevatorAccess: true, tips: '新小区好找，但面积大，看清楚南区北区再进', upVotes: 4, downVotes: 0 },
  { name: '宏地·南塘府', address: '温州市鹿城区南塘街358号', lat: 28.0034, lng: 120.6523, entrance: '南门登记进入', guardAttitude: 2, elevatorAccess: true, tips: '南塘商圈新楼盘，保安要打电话给业主确认才放行', upVotes: 9, downVotes: 2 },
  { name: '京都城', address: '温州市瓯海区景山路666号', lat: 27.9876, lng: 120.6321, entrance: '正门自由进出', guardAttitude: 0, elevatorAccess: true, tips: '小区不大，一共8栋，好找，保安基本上不管', upVotes: 2, downVotes: 0 },
  { name: '瓯海万象城', address: '温州市瓯海区温瑞大道1999号', lat: 27.9623, lng: 120.6412, entrance: '商场大门进入，写字楼B1有通道', guardAttitude: 0, elevatorAccess: true, tips: '大型商业综合体，写字楼电梯和商场分开，从B1临时停车区进', upVotes: 12, downVotes: 1 },
  { name: '枫林花苑', address: '温州市鹿城区府东路200号', lat: 28.0156, lng: 120.6801, entrance: '北门直进，无门禁', guardAttitude: 0, elevatorAccess: false, tips: '90年代小区无电梯，最高6层，3栋在最里面', upVotes: 17, downVotes: 0 },
  { name: '瑶溪新天地', address: '温州市龙湾区瑶溪镇南洋大道188号', lat: 27.9432, lng: 120.7534, entrance: '正门开放，保安偶尔巡逻', guardAttitude: 1, elevatorAccess: true, tips: '瑶溪风景区附近，小区比较偏，导航要准', upVotes: 3, downVotes: 1 },
  { name: '滨江九里', address: '温州市鹿城区瓯江路1888号', lat: 28.0423, lng: 120.6789, entrance: '北门严格管控，南门相对宽松', guardAttitude: 3, elevatorAccess: true, tips: '沿江高端小区，外卖一律走南门登记，北门不让进', upVotes: 22, downVotes: 1 },
  { name: '南瓯景园', address: '温州市瓯海区梧田街道南瓯路158号', lat: 27.9801, lng: 120.6623, entrance: '东门放行，西门关闭', guardAttitude: 0, elevatorAccess: true, tips: '回迁安置小区，保安基本不管，随便进出', upVotes: 7, downVotes: 0 },
  { name: '武林壹号', address: '杭州市拱墅区武林路1号', lat: 30.2741, lng: 120.1656, entrance: '正门管控极严，外卖必须走侧门登记', guardAttitude: 3, elevatorAccess: true, tips: '杭州最严小区之一，建议提前15分钟打电话让顾客来侧门', upVotes: 56, downVotes: 2 },
  { name: '阿里西溪园区', address: '杭州市余杭区文一西路969号', lat: 30.2812, lng: 120.0263, entrance: '南门有外卖专用通道', guardAttitude: 0, elevatorAccess: false, tips: '所有外卖统一放在南门外卖柜，不用进园区', upVotes: 42, downVotes: 1 },
  { name: '西湖银泰', address: '杭州市上城区延安路258号', lat: 30.2467, lng: 120.1689, entrance: '商场电梯或货梯', guardAttitude: 0, elevatorAccess: true, tips: '货梯在停车场出口旁边，比客梯快很多', upVotes: 9, downVotes: 0 },
  { name: '绿城·春江花月', address: '杭州市江干区钱江路388号', lat: 30.2534, lng: 120.2078, entrance: '正门最方便，侧门有时锁着', guardAttitude: 1, elevatorAccess: true, tips: '小区内分ABCDE五个区，E区在最里面', upVotes: 17, downVotes: 3 },
  { name: '滨江·金色海岸', address: '杭州市滨江区江南大道1088号', lat: 30.2089, lng: 120.2134, entrance: '门禁严格，需刷卡或登记', guardAttitude: 2, elevatorAccess: true, tips: '物业有时不让外卖上楼，有专门的取餐台在1楼大厅', upVotes: 24, downVotes: 1 },
  { name: '万象城写字楼', address: '杭州市江干区富春路701号', lat: 30.2556, lng: 120.2156, entrance: '商场B1入口进，绕到写字楼区域', guardAttitude: 0, elevatorAccess: true, tips: '外卖可以上写字楼，但是高峰期电梯排队10分钟起', upVotes: 30, downVotes: 5 },
  { name: '浙大紫金港校区', address: '杭州市西湖区余杭塘路866号', lat: 30.3023, lng: 120.0812, entrance: '多校门，外卖一般送到校门口', guardAttitude: 1, elevatorAccess: false, tips: '学生宿舍区外卖统一放校门口外卖架，不用进校', upVotes: 15, downVotes: 0 },
  { name: '钱江新城国际', address: '杭州市上城区富春路308号', lat: 30.2489, lng: 120.2123, entrance: '正门登记即可', guardAttitude: 0, elevatorAccess: true, tips: '高端写字楼，大堂有外卖暂存点，建议放那让顾客自取', upVotes: 7, downVotes: 1 },
  { name: '九堡家苑', address: '杭州市江干区九堡街道九盛路88号', lat: 30.3123, lng: 120.2789, entrance: '无门禁自由进出', guardAttitude: 0, elevatorAccess: false, tips: '回迁小区无电梯，楼号标示不清，建议电话引导', upVotes: 21, downVotes: 0 },
  { name: '西溪首座', address: '杭州市西湖区文二西路1号', lat: 30.2756, lng: 120.0823, entrance: '园区入口登记', guardAttitude: 0, elevatorAccess: true, tips: '互联网公司聚集地，外卖量大，有集中取餐点', upVotes: 8, downVotes: 0 },
  { name: '望京SOHO', address: '北京市朝阳区望京街10号', lat: 39.9923, lng: 116.4812, entrance: '正门和侧门都行', guardAttitude: 0, elevatorAccess: true, tips: 'T1T2T3三栋楼，看清楚再进，T3外卖最多', upVotes: 35, downVotes: 2 },
  { name: '华贸中心', address: '北京市朝阳区建国路81号', lat: 39.9145, lng: 116.4712, entrance: '北门进入，需登记', guardAttitude: 1, elevatorAccess: true, tips: '高端写字楼，外卖可以送到楼层，但有些公司要求放大堂', upVotes: 12, downVotes: 1 },
  { name: '天通苑', address: '北京市昌平区立水桥北路', lat: 40.0723, lng: 116.4123, entrance: '开放式小区多个入口', guardAttitude: 0, elevatorAccess: true, tips: '亚洲最大小区，分东西南北中五区，务必看准地址', upVotes: 48, downVotes: 3 },
  { name: '国贸三期', address: '北京市朝阳区建国门外大街1号', lat: 39.9089, lng: 116.4612, entrance: '一楼大堂登记', guardAttitude: 1, elevatorAccess: true, tips: '北京最高楼之一，送餐到楼层需要转乘电梯，预留时间', upVotes: 16, downVotes: 2 },
  { name: '三里屯太古里', address: '北京市朝阳区三里屯路19号', lat: 39.9345, lng: 116.4556, entrance: '多个入口开放', guardAttitude: 0, elevatorAccess: true, tips: '商业区人流大，建议把车停路边快速送达', upVotes: 11, downVotes: 1 },
  { name: '陆家嘴金融中心', address: '上海市浦东新区银城中路501号', lat: 31.2397, lng: 121.5023, entrance: '北门登记进入', guardAttitude: 1, elevatorAccess: true, tips: '金融区写字楼，高峰期电梯排队，建议低峰送', upVotes: 22, downVotes: 1 },
  { name: '中远两湾城', address: '上海市普陀区中潭路99号', lat: 31.2567, lng: 121.4412, entrance: '东门南门都开放', guardAttitude: 0, elevatorAccess: true, tips: '大型社区，分四期，每期入口不同，提前确认', upVotes: 18, downVotes: 0 },
  { name: '静安嘉里中心', address: '上海市静安区南京西路1515号', lat: 31.2289, lng: 121.4512, entrance: '商场入口进，写字楼需从B1绕', guardAttitude: 0, elevatorAccess: true, tips: '写字楼电梯分高低区，确认好楼层再进', upVotes: 13, downVotes: 2 },
  { name: '瑞虹新城', address: '上海市虹口区临平路333号', lat: 31.2645, lng: 121.4923, entrance: '正门登记', guardAttitude: 1, elevatorAccess: true, tips: '1-8期连在一起，范围超大，建议导航到具体楼栋', upVotes: 19, downVotes: 1 },
  { name: '田林新村', address: '上海市徐汇区田林路65号', lat: 31.1712, lng: 121.4212, entrance: '无门禁', guardAttitude: 0, elevatorAccess: false, tips: '老小区6层无电梯，楼号已褪色，晚上不好找', upVotes: 25, downVotes: 0 },
  { name: '腾讯滨海大厦', address: '深圳市南山区科技中一路', lat: 22.5223, lng: 113.9412, entrance: '正门登记', guardAttitude: 0, elevatorAccess: false, tips: '有专用外卖柜在大厦一楼，不需要上楼', upVotes: 40, downVotes: 1 },
  { name: '华润万象天地', address: '深圳市南山区深南大道9668号', lat: 22.5367, lng: 113.9512, entrance: '商场侧门进入', guardAttitude: 0, elevatorAccess: true, tips: '写字楼部分电梯需要刷卡，建议联系顾客下来取', upVotes: 14, downVotes: 2 },
  { name: '白石洲城中村', address: '深圳市南山区白石洲', lat: 22.5412, lng: 113.9612, entrance: '无门禁', guardAttitude: 0, elevatorAccess: false, tips: '握手楼密集，巷子窄，电动车难进，建议停大路边走进去', upVotes: 33, downVotes: 0 },
  { name: '平安金融中心', address: '深圳市福田区益田路5033号', lat: 22.5389, lng: 114.0567, entrance: '北门登记进入', guardAttitude: 1, elevatorAccess: true, tips: '深圳第一高楼，电梯分低中高区，确认好楼层对应的电梯', upVotes: 20, downVotes: 3 },
  { name: '坂田华为基地', address: '深圳市龙岗区坂田街道', lat: 22.6512, lng: 114.0589, entrance: '正门严格管控', guardAttitude: 3, elevatorAccess: false, tips: '华为园区安保极严，外卖只能放门口外卖柜', upVotes: 50, downVotes: 1 },
  // ===== 瑞安地区 =====
  { name: '瑞安吾悦广场', address: '瑞安市安阳街道罗阳大道1688号', lat: 27.7834, lng: 120.6456, entrance: '商场大门进，写字楼在商场西侧入口', guardAttitude: 0, elevatorAccess: true, tips: '写字楼电梯在商场3楼连廊，建议从西侧写字楼专属入口进', upVotes: 16, downVotes: 1 },
  { name: '安阳城', address: '瑞安市安阳路268号', lat: 27.7789, lng: 120.6398, entrance: '南门北门都开放，西门有外卖柜', guardAttitude: 0, elevatorAccess: true, tips: '瑞安核心小区，外卖柜就在进西门10米处，放那最省事', upVotes: 23, downVotes: 1 },
  { name: '瑞祥新区·翡翠府', address: '瑞安市瑞祥大道888号', lat: 27.7934, lng: 120.6356, entrance: '正门登记可进，侧门无人管', guardAttitude: 1, elevatorAccess: true, tips: '新区高档楼盘，白天保安严晚上松，建议从侧门进', upVotes: 8, downVotes: 2 },
  { name: '风荷苑', address: '瑞安市瑞祥大道566号', lat: 27.7901, lng: 120.6389, entrance: '东门自由进出，西门需刷卡', guardAttitude: 0, elevatorAccess: true, tips: '老小区比较熟，基本不拦外卖，楼栋号清晰好找', upVotes: 12, downVotes: 0 },
  { name: '天瑞风尚', address: '瑞安市安阳路566号', lat: 27.7812, lng: 120.6423, entrance: '正门出入，不用登记', guardAttitude: 0, elevatorAccess: true, tips: '沿街商住楼，电梯直达各层，送餐方便', upVotes: 5, downVotes: 0 },
  { name: '华瑞豪庭', address: '瑞安市万松东路188号', lat: 27.7767, lng: 120.6489, entrance: '正门严格登记，需业主确认', guardAttitude: 2, elevatorAccess: true, tips: '严格小区，建议提前联系顾客下楼取，别等保安刁难', upVotes: 19, downVotes: 3 },
  { name: '东塔大厦', address: '瑞安市解放中路88号', lat: 27.7856, lng: 120.6289, entrance: '老楼无门禁，自由进出', guardAttitude: 0, elevatorAccess: false, tips: '老城区步梯房，最高7层，楼号有点模糊建议白天送', upVotes: 11, downVotes: 0 },
  { name: '瑞安外滩·香颂', address: '瑞安市滨江大道518号', lat: 27.7712, lng: 120.6312, entrance: '北门进，南门只出', guardAttitude: 0, elevatorAccess: true, tips: '沿江景观房，楼栋号从西到东递增，1栋在最西边', upVotes: 7, downVotes: 0 },
  { name: '锦湖大厦', address: '瑞安市锦湖街道锦湖北路188号', lat: 27.8012, lng: 120.6256, entrance: '大门开放，保安不管', guardAttitude: 0, elevatorAccess: true, tips: '锦湖街道老写字楼，电梯慢但不用登记', upVotes: 4, downVotes: 0 },
  { name: '仙甲季家园', address: '瑞安市莘塍街道仙甲季路99号', lat: 27.8098, lng: 120.6567, entrance: '东门西门都可进', guardAttitude: 0, elevatorAccess: false, tips: '莘塍安置房，无电梯6层，楼栋间距小电动车难拐弯', upVotes: 6, downVotes: 1 },
  { name: '康欣家园', address: '瑞安市经济开发区毓蒙路388号', lat: 27.7689, lng: 120.6612, entrance: '南门进，需登记电动车', guardAttitude: 1, elevatorAccess: true, tips: '开发区保障房，保安登记一下就能进，没什么大问题', upVotes: 9, downVotes: 1 },
  { name: '瑞安时代大厦', address: '瑞安市安阳路1088号', lat: 27.7845, lng: 120.6456, entrance: '正门登记进入，外卖电梯在侧面', guardAttitude: 1, elevatorAccess: true, tips: '写字楼外卖电梯在大楼东侧，比主电梯快', upVotes: 13, downVotes: 0 },
  { name: '中润广场', address: '瑞安市罗阳大道1166号', lat: 27.7801, lng: 120.6512, entrance: '广场多处可进，写字楼需走北门', guardAttitude: 0, elevatorAccess: true, tips: '商业广场+写字楼，送餐到写字楼走北门专用通道', upVotes: 10, downVotes: 1 },
  { name: '宏祥锦园', address: '瑞安市汀田街道文华路78号', lat: 27.8212, lng: 120.6789, entrance: '正门登记', guardAttitude: 1, elevatorAccess: true, tips: '汀田新小区，门牌清楚好找，电动车可进小区', upVotes: 3, downVotes: 0 },
  { name: '瑞安动车站前', address: '瑞安市江南新区站前路1号', lat: 27.7512, lng: 120.6123, entrance: '开放式区域', guardAttitude: 0, elevatorAccess: true, tips: '动车站周边几个新小区聚集，注意区分具体哪个小区', upVotes: 2, downVotes: 0 },
]

export default seeds