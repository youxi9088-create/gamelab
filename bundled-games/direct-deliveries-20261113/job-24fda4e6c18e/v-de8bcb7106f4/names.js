// Culture-based naming: each house draws from its own people, faith and tongue.
// CULT[key] = { n: culture name, faith, eth: ethnicity/people, m: male names, f: female names, s: surnames }
// Every given name and surname belongs to ONE culture only (cross-culture repeats are stripped at load),
// and uniqueName() never hands out a full name a living character already bears.
import { CH } from './state.js';
const L = s => s.split(' ');
export const CULT = {
  aurelian: { n: 'Aurelian', faith: 'The Nameless Light', eth: 'Core-world Aurelians',
    m: L('Aurelian Cassius Valerian Octavian Marcus Lucan Severin Tiberon Corvin Hadrian Maximian Quintus Silvan Darius Lucius Remus Galen Justinian Aquilan Brutian Caelus Decimus Florian Gaius Honorius Lucent Magnus Nerva Priscus Regulus Sextus Titian Vitellan Albinus Constantin'),
    f: L('Aurelia Livia Cassia Octavia Valeria Lucilla Severa Claudia Iulia Flavia Domitia Serena Aemilia Vesta Agrippina Antonia Cornelia Drusilla Fausta Galla Honoria Junia Lucretia Marcella Plautia Sabina Tullia Vipsania'),
    s: L('Solari Valerius Aurex Castellan Lux Halcyon Maren Corvus Aurum Severan Altair Veritas Sanctor Aquila Clarion Dominus Gloriam Imperion Lucanis Nobilis Orbis Radiant Sol-Varro Splendor Tribune') },
  watch: { n: 'Oathsworn', faith: 'The Old Oath', eth: 'Rim-born of many worlds',
    m: L('Varek Oskan Tessar Dravin Halkor Corvane Ulden Maddox Ardan Vaskel Jarric Ossian Rennick Kael Torvin Sabre Idrin Calder Bram Coldren Dunmor Evrik Garran Hesk Jorund Kestrel Lothar Morrow Nevan Orrin Pellam Stannis Ulric Wendel'),
    f: L('Kaela Vessir Ilsa Merrow Sela Ondra Yeva Teska Ravi Halle Brenna Corva Dagny Embra Frost Gwyn Hesper Isolde Jessa Lark Nessa Rowan Sigrun Tamsa Wren'),
    s: L('Farvigil Lastlight Emberwatch Rimhold Coldbeacon Starward Duskline Longvoid Farhaven Grimbeacon Outermark Vantage Blackwall Frostgate Hollowwatch Icevein Nightguard Oathkeep Palebeacon Ravenmark Shieldrim Sternward Voidwarden Wallborn') },
  corsair: { n: 'Corsair', faith: 'Luck and the Void', eth: 'Free-spacers',
    m: L('Rekk Jaxx Vorn Skarr Dez Krell Mako Brask Rhyce Tash Gorrin Zeb Haddo Fenn Rook Slade Corr Bixby Cade Drex Grix Hux Jink Kip Lazz Moxx Nix Ozz Pike Rusk Snag Trigg Vizz Wedge Yarr'),
    f: L('Vex Nyx Rhee Kessa Jyn Sable Raze Mira Tasha Zaya Dree Pell Bree Cinder Dash Echo Fizz Gilly Jinx Krissa Lux Minx Roxa Shiv Trix Vix Zip'),
    s: L('Blackhand Redsail Gutshot Vane Scarlock Rattler Grim Cutter Steelgrin Hookjaw Burnside Coldiron Dagger Bilgewater Boltjaw Crookshank Deadeye Firebrand Gunwale Ironlung Jetsam Knifewright Lasermouth Quickdraw Rustfang Sparkfist Torchsong') },
  qasiri: { n: 'Qasiri', faith: 'The Burning Sands', eth: 'Desert-world Qasiri',
    m: L('Rashid Kadir Faruq Idris Zahir Malik Tariq Hakim Nasir Samir Yusuf Jamal Harun Karim Anwar Salim Qadim Bashir Faisal Ghazi Hamza Ismail Jafar Khalid Mansur Nizar Omar Rafiq Sharif Usama Walid Zayd Adil Basim'),
    f: L('Zahra Layla Nadia Samira Yasmin Amira Leila Soraya Farah Rania Dalia Inara Aisha Basma Dunya Faiza Ghada Halima Jamila Khadija Lubna Maysa Nur Rasha Safiya Taghrid Warda'),
    s: L('al-Qasr ibn-Duran al-Sahir Ma\'adi Harkan Zafir al-Rimah Tazeem Sandreth Qadesh ibn-Sayf Dunari al-Wahid ibn-Rashad al-Kathib Sirocco al-Mirage ibn-Tamar Dunesworn al-Hayyat ibn-Saqr Ghibli al-Nar Khamsin') },
  navigator: { n: 'Navigator', faith: 'The Fold Between Stars', eth: 'Guild-bred Navigators',
    m: L('Theron Phaedon Kallias Lysander Ilias Demetrios Nikandros Orestes Xenon Petros Stavros Leandros Cyrus Aristos Iason Alkaios Damon Evander Heron Isidoros Kleon Menelaos Nereus Pallas Philon Sokrates Telamon Thales Xanthos Zenon'),
    f: L('Ione Thalia Xanthe Phaedra Calliope Daphne Eirene Kallista Selene Ariadne Theodora Alkmene Chloe Danae Elektra Halcyone Iris Kassiani Melina Nephele Penelope Rhea Sappho Thekla Zoe'),
    s: L('Folding Starweft Vectoris Parallax Meridian Periapsis Halcyne Driftmark Astrolos Kepleros Nodus Syzygon Apoapsis Bolidos Ecliptos Foldwright Geodesis Horizontos Inclinos Lagrangis Nadiros Orbitalis Perihelion Zenithos') },
  patrician: { n: 'Patrician', faith: 'The Ledger Eternal', eth: 'Banking patricians',
    m: L('Lorenzo Cosimo Giacomo Ottavio Benedetto Vittorio Matteo Severo Rinaldo Alessio Fabrizio Orsino Dario Emilio Piero Amadeo Baldassare Cesare Ercole Federico Gherardo Leonardo Ludovico Niccolo Pandolfo Raffaello Sigismondo Taddeo Uberto Zanobi'),
    f: L('Lucrezia Beatrice Isabetta Caterina Francesca Ottavia Ginevra Allegra Serafina Bianca Fiorella Alfonsina Clarice Costanza Elisabetta Giovanna Ippolita Laudomia Maddalena Nannina Orsola Piccarda Simonetta Violante'),
    s: L('Mordane Vescari Bellandri Corsini Medrano Aldobrand Valcorte Sangrano Montefiel Orsoline Ruvessi Crimaldi Albizzi Borromei Cambiati Doratelli Fescobaldi Guaratti Lanfreddi Pazzarini Ricciardi Strozzane Tornabelli Usurari') },
  vatborn: { n: 'Vat-born', faith: 'The Template', eth: 'Cloned stock of the Guild',
    m: L('Kade Brik Tor Rhett Dax Holt Fenk Cort Jax Stren Vok Gant Tav Hask Arn Bekk Cull Dorn Ekk Fask Grev Hond Ivo-9 Kell Lok Murr Nev Pax Quor Ruk'),
    f: L('Seren Kiri Tali Vessa Rhu Lenn Isk Imri Zel Tova Anja-4 Bex Cela Dyn Etta Ferr Gwen-2 Hyla Ivi Juna Kev Lio Mesa Nell'),
    s: L('Template-7 Batch Ninefold Prime Fourth-Line Cask Gen-Kest Vat-Orm Lot-Halv Mark-Varr Series-Lux Cradle Strain-Ost Culture-12 Lineage-Brann Tank-Six Graft-Mor Sample-Vey Decant Second-Pour Run-Kessel Matrix-Hal') },
  varkh: { n: 'Varkh', faith: 'The Chain and Coin', eth: 'Varkhan slaver-lords',
    m: L('Gorvash Krath Muurg Vhorrek Dagoth Skarn Bolgar Trask Urzog Zarkh Mordek Grishna Volk Harrok Brutha Azgar Bruuk Durgash Ghorr Haazk Khurvan Lugdush Mazhok Nargul Ozhar Rakhor Shagrat Thrugg Uglash Vrakk'),
    f: L('Vashka Morra Skeela Gruuna Zhessa Kova Draxa Ulka Vreya Thessk Agra Bhurza Dravka Ghessa Hruna Kazra Murzha Narsha Ozka Rhagga Shurra Thukka Uzhra'),
    s: L('Chainfist Varkhul Ironcollar Gorlash Skullmarket Grivaan Blackchain Mawrek Thrallgar Kesh Urvak Brandmark Bloodauction Coinmaw Fetterlord Gaolgrim Hookchain Lashborn Manacle Pitmaster Shacklejaw Taskmaw Whipscar') },
  republic: { n: 'Federal', faith: 'Civic Deism', eth: 'Planetary citizens of the Union',
    m: L('Jackson Wade Harrison Tucker Grant Mason Carter Bennett Lincoln Hayes Colton Reid Spencer Dalton Brooks Garrett Abbott Beckett Chandler Dwight Everett Fletcher Grady Hollis Jefferson Kendall Monroe Porter Russell Truman Walker'),
    f: L('Madison Claire Harper Avery Charlotte Eleanor Riley Quinn Savannah Hazel Morgan Abigail Brooklyn Cora Delaney Evelyn Georgia Hadley Josephine Kennedy Lillian Margaret Paisley Reagan Sydney Whitney'),
    s: L('Calloway Whitfield Brennan Hollister Stratton Garrison McCord Hale Prescott Langley Sutton Wexford Barlow Kincaid Ashford Beaumont Carrington Davenport Ellsworth Fairbanks Hargrove Lockhart Pemberton Remington Thornbury Winslow') },
  directorate: { n: 'Directorate', faith: 'The Optimal Path', eth: 'Human directors of the Alliance',
    m: L('Elon Sergei Ravi Kenji Anders Viktor Tobias Arjun Lars Nikolai Felix Ilya Hiro Soren Kaito Akira Bjorn Dmitri Erik Haruto Ivar Jun Karan Leif Mikhail Nils Pavel Rohan Takeshi Vikram Yuri'),
    f: L('Ada Grace Ingrid Mei Priya Astrid Linnea Yuki Freya Noor Vera Aiko Birgit Chiyo Divya Elin Hana Ishani Kaisa Lakshmi Maja Natalya Rin Sakura Tove'),
    s: L('Vektorov Nakamura Lindqvist Okafor Sato Brandt Kovacs Ishikawa Varga Novak Ferro Halvorsen Patel Ostrova Andersson Chandra Eriksen Fujimoto Ivanova Kimura Mehta Nyberg Petrov Reddy Takahashi Volkova') },
  freeborn: { n: 'Freeborn', faith: 'The Unbroken', eth: 'Lumeri — hardy freed folk of a hundred worlds',
    m: L('Jabari Kwame Tendai Obi Amadi Sefu Zuberi Kofi Baraka Juma Desta Kito Simba Nuru Ayo Bakari Chidi Dumisani Ekon Femi Gyasi Hamisi Jelani Kamau Lumumba Mosi Nnamdi Olumide Rudo Thabo'),
    f: L('Amara Zawadi Nia Imani Asha Makena Zola Ayana Kesi Wanjiru Sanaa Abeni Chiamaka Dayo Eshe Folami Halima-Lu Jamila-Ze Kamaria Lindiwe Malaika Ngozi Oluchi Rehema Thandiwe'),
    s: L('Unchained Mbeki Okonkwo Freewind Adeyemi Kimani Brightdawn Nkosi Mwangi Oduya Liberation Keza Achebe Bosede Chainbreaker Dawnrise Eze Mandela-Kor Ngata Obasi Risenfree Sowande Uhuru Wekesa') },
  ashen: { n: 'Ashen', faith: 'The Ember Ancestors', eth: 'Ashborn clansfolk of the burnt worlds',
    m: L('Conall Fergan Torvek Dughall Kormac Eamon Brodir Kenrik Aed Sigvar Ruairi Halvek Niall Cindral Drust Angus Bearach Cathal Domhnall Faolan Gillan Lachlan Murdoch Odhran Padraig Ronan Seamus Tadhg Uisdean Brannoc'),
    f: L('Aoife Saoirse Brigid Kenna Eithne Gudra Fionna Mairead Sif Orla Emberly Ailsa Blathnaid Caoimhe Deirdre Grainne Isla Muirne Niamh Oonagh Roisin Siobhan Una'),
    s: L('MacAshaig Emberclan Cinderholt O\'Bruadair Smokeborn Kindleaxe Grayhearth MacTormod Firth Ashvale Burnhelm Dubhclann MacCinder O\'Fearghail Pyrecairn Scorchdale Soothmoor MacBrann Charwood Flintmoor O\'Luasa Hearthcairn') },
  dominion: { n: 'Dominar', faith: 'The Iron Throne-Cult', eth: 'Dominion highborn',
    m: L('Dragomir Vladislav Radomir Bogdan Stanimir Yaroslav Miroslav Vsevolod Zoran Dobrinja Kazimir Ratimir Svyatoslav Borislav Branimir Ctibor Drazen Gorislav Lyubomir Mstislav Ostromir Predrag Rostislav Tihomir Velimir Zvonimir'),
    f: L('Vesna Milena Zorana Dragana Ludmila Radmila Yaroslava Bozena Snezana Velika Bogdana Dobrila Gordana Jadranka Ljubica Miroslava Nevena Ognjana Rajna Stanislava Tihana Vojislava'),
    s: L('Voronov Drakhov Kostrava Zhelenko Morozan Strigov Belograd Kragovar Tsarekh Volkhov Grazhdan Ostrog Bronnikov Chernograd Gromov Izhorin Krovavik Lutovar Mechislav Polkovar Smirnograd Temnikov Zheleznyak') },
  coven: { n: 'Coven', faith: 'The Moonless Mother', eth: 'Daughters of the witch-worlds',
    m: L('Vasil Morok Leshen Koschei Dmitar Ryurik Zmey Bazhen Chort Domovar Erem Gromek Lutek Poludan Veles'),
    f: L('Morgana Yaga Rusalka Zlata Vedana Mokosha Dziwa Radunya Lada Marzanna Vesela Zorya Liska Ozana Kalyna Snezha Alkonost Berehynia Dola Kikimora Lybed Mavka Navia Polelya Sirin Uslada Vila Zhiva Yarilka Dennitsa'),
    s: L('Blackmoon Nightveil Thornhex Ravensilk Hollowmoon Mistweaver Bramblecrown Wychwood Duskmother Starblight Hexley Ashgrove Bonecharm Candlewane Fenwitch Gloamhollow Moonbitter Nettlecrown Owlshade Rimefrost Spindlewort Witchlight') },
  freeplanets: { n: 'Libertad', faith: 'Santa Estrella', eth: 'Free colonists',
    m: L('Joaquín Rafael Diego Tomás Andrés Luis Santiago Emiliano Rodrigo Ignacio Alonso Esteban Marco Bento Álvaro Benito César Duarte Fernão Gonzalo Hernán Jaime Leandro Miguel Nuno Pedro Ramiro Sebastião Vicente Xavier'),
    f: L('Lucía Valentina Inês Camila Mariana Elena Sofía Catalina Beatriz Paloma Rosário Adriana Blanca Carmen Dolores Esperanza Fátima Graça Isabel Josefa Leonor Mercedes Nayara Pilar Teresa'),
    s: L('Estrada Castillo Moreira Vega Navarro Serrano Albuquerque Montoya Cardoso Delgado Ferreira Solano Barreto Quintana Aragão Benavides Carvalho de-la-Estrella Figueroa Guimarães Ibarra Lobato Mendonça Ribeiro Saldaña Valdivia') },
  zithari: { n: 'Zithari', faith: 'The Hungering Dark', eth: 'Zithari of the shadow-worlds',
    m: L('Zhaal Siskar Vethrys Xaroth Ssevrin Kaazir Thessith Mal\'zor Ixarus Zyrrhos Vesk Szoth Nhazir Ozryx Azhrael Chessith Drazhul Hissar Ix\'ven Kzarth Nyssar Qeth Rhazzik Ssarnoth Thul\'zar Vyrrix Xelith Zzerath'),
    f: L('Ssyra Zhyss Vaeloth Ixa Sethrine Myrrhsa Xyssa Thalzi Nyzra Zivesh Azhra Cessaly Drysza Esshra Hyssith Ilvesh Ky\'ssa Lirrith Nhessa Qirra Sszivi Thexa Vashi\'ra Yssolde'),
    s: L('Darkcoil Sszarath Vel\'Khar Nightwound Zhaerys Voidmaw Ixthiel Sorrowfang Hessith Umbrys Xal\'tor Shadeblood Ashcoil Blightspine Cryptvenom Duskfang Gloomscale Hollowhunger Nyxtalon Rotgleam Ssilkveil Umbervenom Vexshroud') },
  gray: { n: 'Gray', faith: 'The Balance', eth: 'Order-raised wardens',
    m: L('Tarrin Aldrec Kaelen Merek Tobren Halden Iven Corrin Lorn Ashel Brennic Dovan Teodric Evrand Aubric Belan Cedrin Dorrin Elric Faren Garet Hollis-Ven Ilan Joren Kestin Lucan-Ve Mirren Neris Oriel Perrin'),
    f: L('Elara Sabine Marisse Ilyse Liesl Tamsin Wyneth Aveline Corra Sefi Adwen Brielle Celandine Dorian-Ve Elowen Faye Gwendel Ilsabet Juniper Lirael Meriel Nyssa Ottilie Perpetua Rhiannon Talis'),
    s: L('Graymantle Stillwater Evenhand Ashfall Quietstar Grayhollow Dawnveil Balanceborn Silverdusk Mistvale Twilight Hearthless Calmwater Duskmere Equinox Fairscale Greyward Halfmoon Levelstone Middlemark Palehand Serenvale Truescale') },
  islander: { n: 'Free Corsair', faith: 'The Sea of Stars', eth: 'Free pirates of the drift',
    m: L('Barnaby Flint Calico Jory Silas Ned Rackham Teague Bonnet Mal Wick Crispin Gideon Hob Tobiah Abel Bartholomew Cormac-Lee Davy Ebenezer Fergus Ham Israel Jeb Kit-Lowe Lemuel Mungo Obadiah Percival Rufus Tam'),
    f: L('Anne Mary Grace Bess Jenny Kit Polly Scarlet Ruby Molly Peg Abby Belle Cassie Dora Edie Florrie Hetty Ivy Jo Lottie Maggie Nell-Bright Tilly Winnie'),
    s: L('Bonny Kidd Teach Low Roberts Cutlass Saltbeard Driftwood Bellamy Starboard Gallows Every Anchorhook Barnacle Cannonade Doubloon Grogwater Jollyroger Keelhaul Mainmast Plankwalker Spyglass Tidewrack') },
  forgotten: { n: 'Forgotten', faith: 'The Drowned Admiralty', eth: 'Wraiths of a lost armada',
    m: L('Aethelred Morvane Ulfrec Godrin Wulfstan Eadric Leofric Osbert Cynric Ealdred Aldhelm Wigmund Aelfric Beornoth Ceolwulf Dunstan Eadwig Frithuric Guthlac Hereward Oswin Penda Sigeberht Wulfhere'),
    f: L('Aethelflaed Eadgyth Wynflaed Cyneburh Hild Aelfgifu Godgifu Leofrun Aelswith Beorhtgifu Cwenburh Eadburh Frideswide Mildthryth Osthryth Wulfrun'),
    s: L('Drownmark Hollowmast Lastfleet Palewake Gravewind Starless Wreckmourn Unburied Dimlight Coldvoid Ashkeel Blackhull Deepwreck Fathomless Ghostsail Lostanchor Mourntide Sunkenmast Tidegrave Wraithwake') },
  horde: { n: 'Horde', faith: 'The Sky-Wolf', eth: 'Steppe-world raiders',
    m: L('Temur Batu Subutai Jochi Arslan Khasar Toghrul Mongke Kublai Ogedei Berke Qutlugh Jebe Tolui Bori Altan Bayan Chagatai Esen Ghazan Hulagu Kaidu Mukhali Nogai Orda Sartaq Tokhta Uzbeg Yesugei'),
    f: L('Borte Khutulun Sorghaghtani Alaqai Checheyigen Toregene Mandukhai Oghul Yesui Altani Bulugan Chabi Doquz Ebegei Hoelun Khojin Mergen Odval Sarnai Tegulen'),
    s: L('Khan Wolfborn Ninetails Skyrider Bloodmane Ironhoof Stormhorde Greyclaw Ashmane Duststrider Bonecaller Arrowstorm Blackyurt Eaglebrand Grassfire Horsetail Redsteppe Spearwind Thundermare Whitewolf') },
};
// ZenGM-style expansion: real-world national name pools mapped onto each in-universe people.
const MORE = {
  aurelian: ['Adrian Antonin Atticus Aurelio Caius Cato Cyprian Drusus Felix-Aur Fabian Germanus Hilarion Lavinius Lentulus Marius Maximus Nero Petronius Quirinus Rufinus Scipio Septimus Tacitus Ulpian Varro',
    'Aelia Albina Avita Calpurnia Camilla Crispina Faustina Fulvia Hortensia Laelia Licinia Lollia Messalina Nonia Pompeia Porcia Quintilla Septimia Statilia Terentia',
    'Aemilius Benedictus Caelestis Divinus Fidelis Gloriosus Invictus Iustus Laurentis Magnificus Optimus Pius-Aur Sanctus Serenus Triumphus Victorius'],
  watch: ['Aldo Bjarn Cormac-Rim Drest Eskil Fenwick Gunnar Halvard Ingvar Joss Kjell Lorcan Magnar Njal Osric Ragnar Sten Thorne Ulf Vidar Wulf Yorick',
    'Alva Britt Edda Freydis Gerd Hilde Inga Liv Ragna Runa Solveig Thora Unn Vigdis Ylva',
    'Coldwatch Darkrim Edgeward Frostmark Greywall Hardvigil Ironwatch Lonebeacon Northwall Rimguard Stillwatch Thornwall Winterhold'],
  corsair: ['Axl Bazz Crank Dutch Flick Gash Hatch Jolt Klank Lug Nub Pox Quint Riff Scab Tank Vance Zork',
    'Ace Blaze Coil Dyna Fuse Glitch Hex Kat Neon Pixie Rivet Spark Static Volt',
    'Brokenwing Chainsaw Dustjack Gearbreak Hotwire Junkfist Loosebolt Overdrive Razorwire Scrapjaw Shortfuse Wrenchhand'],
  qasiri: ['Abbas Ahmad Ali Amjad Ayman Badr Fadi Fahad Hassan Hisham Imad Jawad Kamal Marwan Mustafa Nabil Osama Qasim Riyad Saad Tamim Wael Yasir Ziyad',
    'Asma Bushra Hiba Huda Iman Jumana Karima Lina Manal Marwa Nawal Rima Salma Sana Suha Wafa Yara Zainab',
    'al-Ansari al-Baghdadi al-Hashimi al-Masri al-Najjar al-Shami al-Tikriti ibn-Khaldun ibn-Battuta al-Zahrani al-Farsi al-Maghribi'],
  navigator: ['Achilleas Anastasios Christos Dimitris Giorgos Ioannis Konstantinos Lefteris Michalis Panagiotis Spyros Thanasis Vasilis Yannis Antonis Kostas Manolis Nikos',
    'Anastasia Athena Despina Evangelia Georgia-Nav Katerina Maria-Nav Niki Olympia Sofia-Nav Stella Vasiliki',
    'Andreadis Christakos Dimopoulos Economou Georgiou Kanellos Lambrakis Mavros Pappas Stathakis Theodorou Vlachos'],
  patrician: ['Alberto Andrea Antonio Carlo Danilo Enzo Fabio Franco Gianluca Luca Marco-Pat Massimo Nicolo Paolo Riccardo Roberto Salvatore Stefano Tommaso Vincenzo',
    'Alessandra Chiara Elena-Pat Federica Giulia Ilaria Lorenza Martina Paola Rosalba Silvia Valentina-Pat',
    'Barbieri Cattaneo Fontana Lombardi Moretti Esposito Rossi Ferrari Romano Colombo Bruno Ricci Marino Greco Conti DeLuca'],
  vatborn: ['Abel-3 Bram-11 Cass-5 Drey Enn-8 Fyr Gord-2 Hux-7 Ixo Jett-4 Krel-6 Lyle-9 Moss Nyx-1 Orr-3',
    'Ama-7 Bria-5 Cyn-3 Dara-8 Eve-1 Faia-6 Gia-4 Hali-2 Isa-9 Jae-3',
    'Clone-Thal Copy-Mard Echo-Vas Facsimile Graft-Bel Iteration Mirror-Kael Replica-Dunn Sequence-Var Twin-Orl'],
  varkh: ['Bazgul Drogath Gorbag Grimzag Krugg Lurtz Mogdush Orgrak Rugluk Skagg Ugak Vorgash Yazgul Zogrok',
    'Brakka Durza Grukka Mogha Rukka Sharga Ulgra Yagga Zogha',
    'Bonesaw Cagewright Debtmaw Goldcollar Ironbrand Neckchain Scarbrand Thralltaker'],
  republic: ['Austin Blake Brandon Chase Cody Dakota Derek Dylan Ethan Hunter Jordan Kyle Logan Lucas Nathan Ryan Tyler Zachary',
    'Ashley Brianna Courtney Emily Hailey Jessica Kayla Lauren Megan Natalie Rachel Taylor',
    'Anderson Baker Clark Davis Edwards Foster Gibson Harris Jenkins Lewis Mitchell Parker Robinson Thompson Turner Wilson'],
  directorate: ['Aleksander Daichi Emil Gustav Hiroshi Jonas Kazuki Magnus-Dir Mats Oskar Rasmus Ren Sanjay Satoshi Sven Tomas Vijay Yusuke',
    'Anika Asuka Dagny-Dir Emi Helga Kirsten Mio Nanami Pooja Ritu Saga Sigrid Ylva-Dir',
    'Bergstrom Dahl Hansen Johansson Kobayashi Larsen Matsumoto Nordin Rao Sharma Suzuki Tanaka Watanabe Yamamoto'],
  freeborn: ['Abdoulaye Babatunde Chinedu Emeka Ibrahima Kelechi Mamadou Moussa Ousmane Seydou Tunde Uche Yaw Kwabena Adebayo Oluwaseun',
    'Adaeze Aminata Fatoumata Folake Mariama Nkechi Ama Efua Yewande Funmilayo',
    'Diallo Adebisi Kabongo Nwosu Ndiaye Sow Traore Ogundipe Mensah Boateng Okafor-Lu Asante Owusu Keita'],
  ashen: ['Brendan Cian Colm Declan Donal Eoin Fionn Kieran Lorcan-Ash Malachy Oisin Rory Shane Torin',
    'Ciara Clodagh Eabha Fiadh Maeve Nuala Sorcha Treasa',
    'Byrne Doherty Gallagher Kavanagh MacNeil Mulligan O\'Connell O\'Donnell Quinlan Sheridan'],
  dominion: ['Aleksandar Dejan Goran Igor Milos Nemanja Nikola Stefan Vlade Zarko Bojan Darko Marko-Dom Dusan Luka Srdjan',
    'Ana-Dom Biljana Dragica Ivana Jelena Katarina-Dom Marija Mirjana Natasa Svetlana Vesna-Dom',
    'Markovic Pavlovic Ilic Stankovic Milosevic Petrovic Lazarevic Popovic Zivkovic Tomic Nikolic Jovanovic'],
  coven: ['Bohdan Myroslav Ostap Taras Vseslav Yarema',
    'Bogna Dobrava Halyna Ivanka Lesya Mila Oksana Olesya Svitlana Ulyana Wanda Zoryana',
    'Bitterroot Cauldronmere Darkspindle Moonwort Nightcandle Shadowloom'],
  freeplanets: ['Anderson-Lib Bruno-Lib Carlos Fernando Gustavo Javier Jorge Manuel Marcelo Pablo Raul Ricardo Sergio Thiago',
    'Ana-Lib Camila-Lib Daniela Fernanda Gabriela Juliana Larissa Luana Patricia Renata',
    'Acosta Medina Rojas Pereira Fuentes Garcia Gonzalez Hernandez Lopez Martinez Perez Rodriguez Sanchez Silva'],
  zithari: ['Azrith Kessith Nhyrr Sszet Vorthis Xazul Zhyrran',
    'Isszra Nyrrith Szela Vhyss Zhaira',
    'Blackvein Cinderfang Nightmaw Rotspire Shadowcoil'],
  gray: ['Alden Bastian Cassian Darian Ewan Fenric Gavin Jasper Lucien Matthias Nolan Quentin Silas-Gray Tristan',
    'Aelith Bryony Clemence Esme Isolde-Gray Linnet Marigold Rosalind Sylvie Verity',
    'Ashmoor Driftgrey Evenmoor Greystone Moonmeadow Quietwater Stillbrook'],
  islander: ['Archibald Cuthbert Ezekiel Horatio Ichabod Jonas-Isl Nathaniel Phineas Thaddeus Zebedee',
    'Agnes Betsy Clementine Hester Lucy Martha Patience Prudence',
    'Blackwater Hornswoggle Longjohn Marlinspike Rumrunner Saltwind'],
  forgotten: ['Aelfwine Brihtnoth Cuthred Eanred Godwine Heahmund Oswald Wilfrid',
    'Aelfflaed Eadwynn Hereswith Seaxburh',
    'Ashenwake Grimkeel Hollowfleet Paleanchor'],
  horde: ['Baatar Bat-Erdene Ganbold Khurelsukh Munkh Sukhbaatar Tumur Ulzii Altangerel Chinggis',
    'Altantsetseg Bolormaa Enkhjargal Gerel Khulan Narantuya Oyun Tsetseg',
    'Bluesky Hawkrider Mareborn Swiftbow Thunderhoof'],
};
// "-Xyz" tags only mark drafting variants; strip them (the dedupe below drops any resulting repeat).
const T = s => L(s).map(n => n.replace(/-(Aur|Rim|Nav|Pat|Dir|Lu|Ash|Dom|Lib|Gray|Isl)$/, ''));
for (const [k, [m, f, s]] of Object.entries(MORE)) { const c = CULT[k]; if (!c) continue; c.m.push(...T(m)); c.f.push(...T(f)); c.s.push(...T(s)); }
// Safety net: a name may live in only one culture (first culture listed keeps it).
(() => {
  for (const kind of ['m', 'f', 's']) {
    const seen = new Set();
    for (const c of Object.values(CULT)) {
      c[kind] = c[kind].filter(n => { const k = n.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
    }
  }
})();
// Which culture each house is born into (faction index → culture). The Nightfleet takes in exiles of every people.
export const FCULT = { 0: 'aurelian', 1: 'watch', 2: 'corsair', 3: 'qasiri', 4: 'navigator', 5: 'patrician', 6: 'vatborn', 7: 'varkh', 8: 'republic', 9: 'directorate', 10: 'freeborn', 11: 'ashen', 12: 'dominion', 13: 'coven', 14: 'freeplanets', 15: 'zithari', 16: 'gray', 17: 'islander', 18: 'forgotten', 19: 'horde', 20: 'corsair' };
const pick = a => a[Math.floor(Math.random() * a.length)];
export function cultureOf(f) {
  let k = FCULT[f];
  if (!k) k = pick(Object.keys(CULT)); // rebels & splinters: a mix of peoples
  if (k === 'watch' && Math.random() < 0.4) k = pick(Object.keys(CULT).filter(x => x !== 'coven' && x !== 'forgotten')); // exiles keep their old names
  return k;
}
// Names borne by the living (first names and full names), rebuilt lazily.
function living() {
  const first = new Set(), full = new Set();
  for (const c of Object.values(CH)) { if (!c || c.dead || !c.name) continue; full.add(c.name); first.add(c.name.split(' ')[0]); }
  return { first, full };
}
// Prefer a first name no living character carries; fall back gracefully if the pool is exhausted.
export function firstName(k, fem) {
  const c = CULT[k] || CULT.aurelian, pool = fem ? c.f : c.m, { first } = living();
  const free = pool.filter(n => !first.has(n));
  return pick(free.length ? free : pool);
}
export function surname(k) { return pick((CULT[k] || CULT.aurelian).s); }
// A full name nobody alive bears.
export function uniqueName(k, fem) {
  const c = CULT[k] || CULT.aurelian, { full } = living();
  let n = '';
  for (let i = 0; i < 30; i++) { n = pick(fem ? c.f : c.m) + ' ' + pick(c.s); if (!full.has(n)) return n; }
  return n;
}
export const cultLabel = k => { const c = CULT[k]; return c ? `${c.n} · ${c.faith}` : ''; };
export const CAPT_RANK = ['Captain', 'Commander', 'Shipmaster', 'Line Captain'];
