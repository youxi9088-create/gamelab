// ---- 📖 Game Manual: chaptered in-game guide (opened from ☰ How to Play and the 📖 Book) ----
const CH = {
  '🎮 Controls': null, // filled with the HELP text from main.js
  '🌌 The Campaign': `<h3>🌌 The Campaign</h3><div class="scroll">
You lead the <b>Aurelian Throne</b> (gold). Each turn you collect income, recruit forces and move fleets along hyperlanes. <b>Two turns make one year</b>: characters age, wards grow up, rulers die and houses fall into succession.<br><br>
<b>Victory</b> comes through conquest and survival. Your house dies if it loses its last world and its last heir, so look after your bloodline as carefully as your fleets.<br><br>
<b>A turn:</b><br>• Read the ✉ news.<br>• Visit your worlds (◀ ▶ cycles them): build, recruit, set governors.<br>• Move fleets and agents. Each has a limited number of moves per turn.<br>• Press ⏳ to end the turn. Its badge counts units you haven't given orders to yet.</div>`,
  '🪐 Worlds & Economy': `<h3>🪐 Worlds & Economy</h3><div class="scroll">
Every world has <b>income</b> (its size), <b>public order</b> (0–10), a <b>religion</b>, resources and buildings.<br><br>
<b>Public order</b> comes from the garrison, the governor (his Administration), buildings, faith and policies. Tap a world's order to see every factor.<br>• Low order cuts income.<br>• A world at <b>order 0</b> may revolt and declare independence. Every legion stationed there makes that less likely.<br><br>
<b>Buildings</b> come in chains: Barracks, Shipyard, Temple, Market, Brothel and Mine. Higher levels need a bigger world and take several turns to build. Captured or sacked worlds lose building levels.<br><br>
<b>Great Works</b> (Space Station, Terraforming, Starblades…) are built by every house, AI included. Superweapons need a Space Station and take <b>10–20 years</b> (World Devastators 10, World Eater 15, Star Eater 20). Great Works halt under blockade and are lost if the world falls. Abandoning one refunds half the cost.<br><br>
<b>Population</b> grows each year from food, order and buildings, and shrinks under plague and war.<br><br>
<b>Supply lines:</b> a world earns its full income only while it links back to your capital through your own, allied, vassal or neutral worlds. A blockade, a world at war with you or a hostile fleet of 3+ ships breaks the chain, and cut-off worlds yield only 60%. A fleet that is not on or next to one of your supplied worlds (or an ally's) pays 1.5× upkeep.<br><br>
<b>Graft:</b> greedy, drunken or disloyal governors skim part of their world's income (up to 20%). Just, Loyal, Generous and Pious men skim less. Each year your ruler's Administration, your Probe AIs and a Paranoid or Just ruler may uncover a skimmer, and then you choose: confiscate, dismiss or pardon.<br><br>
<b>💰 Treasury</b> (☰ Menu, or tap your Credits) breaks down income and upkeep. A ⚠ appears there when worlds are cut off or governors are skimming.</div>`,
  '⚔ Fleets & Battles': `<h3>⚔ Fleets & Battles</h3><div class="scroll">
<b>Fleets</b> carry ships and legions. Every fleet has a <b>Captain</b>. You can promote a Captain into a real general, and a general gives far better leadership.<br><br>
<b>Moving:</b> select your fleet, then tap a linked world (green ring). Entering a hostile world asks <b>Attack or Withdraw</b>. Attacking a house you are at peace with declares war.<br><br>
<b>Orbital battles:</b> you fight the station, the pickets and every hostile fleet in orbit at once. <b>Reinforcements</b>: your other fleets in the same orbit, and general-led fleets one jump away, join in and share the losses.<br><br>
<b>Assault:</b> once orbit is clear, your legions storm the world, led by the commander you choose.<br><br>
<b>Battle modes</b> (⚙ Settings):<br>• <b>Text</b>: give orders round by round: stances, ambushes, feints, Dig In, Rally. A side breaks at 30% strength.<br>• <b>Tactical</b>: a real-time battle.<br>• <b>Auto-resolve</b>: available every time.<br>The winner's losses are halved.<br><br>
<b>Battle power</b> comes from numbers, command, traits, retinue, and the general's Respect or Fear (up to ±10%).</div>`,
  '👑 Characters': `<h3>👑 Characters</h3><div class="scroll">
Tap any name to open a character's bio.<br><br>
<b>Attributes:</b><br>• <b>Command</b> wins battles.<br>• <b>📜 Administration</b> is what makes a good governor. Each point adds +2.5% income to the world he governs, and every 5 points add +1 public order (up to +2). It grows through governing, Taxation policy, mentors, and retinue such as a Scientist or Master of Coin. The AI picks governors by Administration, Command and loyalty.<br>• <b>Loyalty</b> keeps generals and governors faithful.<br>• <b>Piety</b> helps on worlds of his own faith. A governor with piety 8 or more gives +1 order there.<br>• <b>Influence and Charm</b> sway diplomacy.<br>• <b>🛡 Respect / 💀 Fear</b> is one axis. Releasing or ransoming captives builds Respect; executing or enslaving them builds Fear.<br><br>
<b>Authority</b> (rulers only) comes from command, fame or fear, years on the throne, victories and deeds. High Authority keeps governors in line; a weak or boy ruler invites rebellion.<br><br>
<b>Traits and retinue</b> are earned through life. Generals on hostile borders become Vigilant, idle nobles grow Indolent, and Brothels breed Drunkards. Retinue members (Food Taster, Siege Engineer, Plague Doctor…) give lasting bonuses.<br><br>
<b>🏚 Ruins</b> hold tech, Starblades, retinue and salvage, but the vaults can kill. The death chance falls with Command, caution, a Starblade and retinue such as a Squire, Battle AI or Void Hound. Recklessness, drink and old age raise it. AI lords weigh the same risk.<br><br>
<b>Officers</b> not in a seat wait in a world's reserve. You can make them governors, give them fleets or send them to court.<br><br>
<b>Old age:</b> everyone past 80 risks death each year, rulers included.</div>`,
  '🩸 Dynasty & Succession': `<h3>🩸 Dynasty & Succession</h3><div class="scroll">
<b>Succession</b> is primogeniture: the ruler's sons first, then other kin by age. (The Pirate Elect sort heirs by claim instead.) When a ruler dies, the heir is crowned and takes over the capital.<br><br>
<b>Blood and claim:</b> royal blood and closeness to the last ruler make a claim. A rival heir or royal governor with a close claim, low loyalty and enough followers may start a <b>succession war</b>. He takes exactly the worlds that follow him.<br><br>
<b>Claim wars end in one house.</b><br>• The pretender is crowned if he takes the capital or holds twice your worlds.<br>• He is crushed if he dies or is captured.<br>• Peace between the two sides goes to whoever holds more worlds.<br><br>
<b>Marriage:</b> betrothal is only a promise. The alliance forms at the wedding. Princesses aged 14+ travel as envoys and carry their own marriage embassies.<br><br>
<b>Bastards</b> are rare. Lechery, drink, low purity, brothels, and cold or childless marriages make them likelier; piety restrains a man, and the Chaste never stray. Rulers are no exception. They live at court but are outside the line of succession. 📜 <b>Legitimise</b> one (300 gold) to add him: he gains loyalty, and your trueborn sons resent it.<br><br>
<b>Wards and captives</b> may swear fealty to you, depending on their loyalty and your Respect.</div>`,
  '🗡 Honour & Intrigue': `<h3>🗡 Honour & Intrigue</h3><div class="scroll">
<b>Nemeses:</b> defeats, slain kin and crushing losses breed hatred between real characters. Commanders near a hated foe may beg leave to strike him. At peace, that becomes a border clash.<br><br>
<b>Duels:</b> a man with a bitter nemesis within one jump may challenge him. You can let your man fight or forbid it (he loses loyalty). If one of your men is challenged, refusing costs Respect and may brand him a Coward. Duels are fought blow by blow; the loser usually dies, otherwise he yields in shame.<br><br>
<b>Keepers:</b> your capital's governor (or else your ruler) holds wards and prisoners. Torture, executions and cruelty fall on him.<br><br>
<b>Court plots:</b> captive houses send real Probe AIs, bounty hunters or kinsmen to free their people. When a plot is uncovered, you choose: double the guard, lay a trap, or trust your keeper.<br><br>
<b>Bastards at 14</b> ask to be legitimised. If you refuse, those without a post may take vows and join an Order. Some children are not what they seem, because secret parentage can come to light years later.<br><br>
<b>Captives & bondage:</b> AI victors take prisoners too. Each year their keeper decides by temperament: ransom (you may be asked to pay), fealty, torture, sale into slavery (slaver houses and cruel lords), execution, or mercy. Prisoners may escape. Enslaved nobles can be freed when their masters fall, liberated by the Unchained at war, bought back by their kin, or they may escape or die in the pits. Your own named slaves are in Court → ⛓ Named Slaves. The Archive records every captivity, wardship, torture and enslavement.<br><br>
<b>Vassals:</b> send a Diplomat to a weaker house to demand it kneel, or offer your own fealty to a stronger one. Liege and vassal are allied. The vassal pays tribute each year (up to 15 credits per world) and joins its liege's new wars, and the liege must defend it when it is attacked. A vassal that grows stronger than its liege, or is badly wronged, may break its oath. Renouncing or attacking your liege ends the bond and may mean war.<br><br>
<b>The Dark Path:</b> nobody falls by chance. Massacres, slaughtered children, enslaved worlds, executions and superweapon strikes stain a man. A man falls only when he is both deeply stained and widely dreaded. The stain fades slowly, and mercy can redeem him.<br><br>
<b>Elections</b> (Nightfleet Council, Grandmaster, Senate, Moot…): you may watch or back a candidate with gold. A bribe abroad may be exposed.<br><br>
<b>📚 The Archive</b> (☰ Menu) records every life, war, battle, duel, plot, marriage and Starblade.</div>`,
  '🔥 Rebellion': `<h3>🔥 Rebellion</h3><div class="scroll">
Governors aren't ruled by dice. Each one carries <b>discontent</b> that grows or fades every year, depending on:<br>• his loyalty<br>• his traits (Ambitious and Greedy raise it; Loyal and Trusting lower it)<br>• the size of your realm (beyond 8 worlds)<br>• your ruler's Authority, age and Fear<br>• any vendetta against your house<br><br>
A governor rises only when he is truly discontented <b>and</b> his own world, together with his sullen neighbours, is strong enough to hold. A royal governor with a close claim becomes a <b>Pretender</b>; anyone else founds a "Kingdom of X".<br><br>
<b>When one stirs</b> you may:<br>• grant him estates<br>• let him try<br>• recall him to court (he obeys only if his loyalty and your Authority outweigh his anger)<br><br>
<b>Prevention:</b> keep loyal men in big worlds, garrison your borders, and keep a strong, respected ruler on the throne.</div>`,
  '🕊 Diplomacy': `<h3>🕊 Diplomacy</h3><div class="scroll">
<b>Diplomacy travels.</b> Alliances, peace, marriages, tribute and blood-price offers are carried by Diplomats or Princesses, one jump per turn. Killing an envoy ends his mission. The envoy's Influence or Charm sways the answer.<br><br>
<b>Hostages:</b> after a peace treaty both sides may exchange young sons as hostages and free their prisoners. Whoever breaks the peace leaves his hostages at the other house's mercy: they may be slain, kept as wards or spared.<br><br>
<b>Memory:</b> every house remembers what you did: wars, broken pacts, executions, gifts. Opinions run from −30 to +30 and drive AI wars, alliances and marriages. See them in 📖 Ledger → 🧠 Grudges & Motives.<br><br>
<b>The Bloodbank</b> lends gold. Default on a loan and it will back a pretender against you.<br><b>Mercenaries:</b> some houses sell troops into a shared market, and anyone can hire from that stock.</div>`,
  '✠ Faith & the Nameless': `<h3>✠ Faith & the Nameless</h3><div class="scroll">
<b>The Nameless</b> are the papal power, led by a Grandmaster elected by the Council. <b>Standing</b> with them matters:<br>• Low standing invites sanctions, then <b>excommunication</b>. Excommunication costs order on Order worlds, angers pious governors and may bring holy war.<br>• You can be absolved for gold once your standing has recovered.<br>• The Grandmaster can also order ceasefires and lay interdicts on worlds.<br><br>
<b>Reclamations</b> are holy wars that target only the five <b>holy worlds</b>.<br>• Order Reclamations are called by the Grandmaster or petitioned by houses.<br>• Dark Reclamations are proclaimed by Zithari preachers standing on or next to a holy world.<br><br>
<b>The Inquisition:</b> Masters put heretics on trial, weighing their own piety against the accused's. Rulers of houses with low standing or under excommunication can be tried too.</div>`,
  '🌑 Threats': `<h3>🌑 Threats</h3><div class="scroll">
<b>The Nightfleet</b> guards the outer rim. It lives on donations from the houses, and refusing its levy brings raids. It may fight only pirates, barbarians and dark powers. Its generals grow hard and feared on the rim, and some break their oaths.<br><br>
<b>The Apocalypse:</b> dark deeds feed the Apocalypse level: extermination (+6), mass enslavement (+3.6), sacking (+1.6), executions, betrayals and long wars. Only peace, mercy, temples and charity bring it down. At <b>50</b> every world suffers −1 order, and at <b>75</b> −2 (the End Times). The higher it climbs, the more often catastrophes strike. As it rises, omens warn of the <b>Forgotten Fleet</b>: seven masked lords and their ghost dreadnoughts. Once awake it is the late-game horde. It falls on the Nightfleet first and keeps at it while any Nightfleet world stands, then turns on everyone else. Its lords are undying: <b>only a general bearing a Starblade</b> can destroy one. Anyone else only drives them back into the dark, where they gather again.<br><br>
<b>Grey Rot</b> spreads along hyperlanes. You can quarantine worlds; Plague Doctors save generals.<br><b>Events:</b> harvests and famines, and Free Planets no-confidence votes.<br><br>
<b>Grand Tourneys</b> (about one year in seven): each house sends up to two champions, chosen from its governors, reserve officers, heirs and even its ruler. They compete in six contests (joust, Starblade Circle, ring race, blaster gallery, grav-pit brawl, holo-wargame). Placings earn points for the champion's house, and the top house becomes Champion House. Every contest has its own betting book, and you can try to pay a rival to shave points. Riders can be maimed or killed, and a ruler who dies in the lists leaves his throne to his heir.</div>`,
  '🕵 Agents': `<h3>🕵 Agents</h3><div class="scroll">
<b>Agents</b> include Diplomats, Princesses, Probe AIs, Bounty Hunters, Traders, Masters and preachers. Each action shows its chance of success. Failure can mean the agent's death.<br><br>
<b>Bounty Hunters</b> can strike generals, governors, foreign officers and rulers at their capitals. Guards, Food Tasters, Void Hounds and Probe AIs protect targets, and a survivor of an attempt grows harder to kill.<br><br>
<b>Probe AIs</b> watch the world they stand on, or escort one of your lords wherever he goes. They make bounty hunters likelier to fail and be caught, and they unmask enemy agents. Probe AIs and Bounty Hunters work in the shadows and never earn nicknames.<br><br>
<b>Merchants</b> earn more from rich, resource-heavy worlds, and more still on foreign soil.</div>`,
  '🧰 Tools': `<h3>🧰 Tools</h3><div class="scroll">
• <b>💾 Save / Load</b>: 6 slots plus a yearly autosave.<br>
• <b>👥 Hotseat / 🌐 Online</b>: share a device, or host a game with a 5-letter code.<br>
• <b>🛠 God Mode</b>: edit the galaxy; Ctrl+Z undoes your last action.<br>
• <b>🧪 Spectator Simulation</b>: let the AI play 25–100 years and read a report of what happened.<br>
• <b>📜 Court Docket</b>: routine reports filed while turns resolve, beyond your budget of popups. Crucial news always pops up.<br>
• <b>📋 Standing Orders</b>: answer recurring questions in advance (ransoms, peace terms, duels, leave to strike, plots…), set the popup budget, and turn the advisor on or off. If your standing order doesn't fit a situation, you are asked instead.<br>
• <b>Advisor</b>: one short tip after each turn (treasury, cut-off worlds, unrest, empty seats, threats).<br>
• <b>📑 Lists</b> (Faction page): all your planets, armies and agents.<br>
• <b>🔊</b> (top right): mute.</div>`
};
export async function showManual(ask, help) {
  CH['🎮 Controls'] = help;
  for (;;) {
    const r = await ask('<h3>📖 Game Manual</h3><small>Choose a chapter.</small>', [...Object.keys(CH), 'Close']);
    if (!CH[r]) return;
    const n = await ask(CH[r], ['◀ Back', 'Close']);
    if (n !== '◀ Back') return;
  }
}
