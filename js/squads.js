/* ===== Gente Boa's League — Aba Elencos (Team Hub estilo EA FC / PES 21) ===== */
(() => {
  const SQUADS_KEY = 'gbl.squads.v2';
  const CLUBS_KEY = 'gbl.clubs.v2';
  const TRANSFERS_KEY = 'gbl.transfers.v2';

  const POSITION_GROUPS = [
    { id: 'gk', title: 'Goleiros', sub: 'GK', positions: ['GK'] },
    { id: 'def', title: 'Defensores', sub: 'CB · LB · RB', positions: ['CB', 'LB', 'RB'] },
    { id: 'mid', title: 'Meio-campistas', sub: 'DMF · CMF · AMF · LMF · RMF', positions: ['DMF', 'CMF', 'AMF', 'LMF', 'RMF'] },
    { id: 'fwd', title: 'Atacantes', sub: 'RWF · LWF · SS · CF', positions: ['LWF', 'RWF', 'SS', 'CF'] },
  ];

  // 17 clubes oficiais do torneio (18º clube em breve) com plantéis do PES 21
  const DEFAULT_SQUADS = [
    {
      id: 'sq1',
      name: 'Joker FC',
      manager: 'Kalleby',
      stars: 5,
      primaryColor: '#7e22ce',
      secondaryColor: '#f5c84c',
      formation: '4-2-1-3 Contra-Ataque',
      captain: 'N’Golo Kanté (90)',
      recentForm: ['W', 'W', 'D', 'W', 'W'],
      roster: [
        { id: 'p201', pos: 'GK', name: 'Courtois', ovr: 90 },
        { id: 'p202', pos: 'GK', name: 'Areola', ovr: 82 },
        { id: 'p203', pos: 'CB', name: 'Rúben Dias', ovr: 89 },
        { id: 'p204', pos: 'CB', name: 'Varane', ovr: 87 },
        { id: 'p205', pos: 'CB', name: 'Militão', ovr: 85 },
        { id: 'p206', pos: 'LB', name: 'Theo Hernández', ovr: 86 },
        { id: 'p207', pos: 'RB', name: 'Cancelo', ovr: 88 },
        { id: 'p208', pos: 'DMF', name: 'Kanté', ovr: 90 },
        { id: 'p209', pos: 'DMF', name: 'Fabinho', ovr: 87 },
        { id: 'p210', pos: 'CMF', name: 'Saúl', ovr: 84 },
        { id: 'p211', pos: 'CMF', name: 'Modrić', ovr: 88 },
        { id: 'p212', pos: 'AMF', name: 'Bernardo Silva', ovr: 88 },
        { id: 'p213', pos: 'LWF', name: 'Son Heung-Min', ovr: 89 },
        { id: 'p214', pos: 'RWF', name: 'Di Maria', ovr: 87 },
        { id: 'p215', pos: 'RWF', name: 'Chiesa', ovr: 85 },
        { id: 'p216', pos: 'CF', name: 'Haaland', ovr: 91 },
        { id: 'p217', pos: 'CF', name: 'Cristiano Ronaldo', ovr: 91 },
        { id: 'p218', pos: 'SS', name: 'Dybala', ovr: 87 },
      ],
    },
    {
      id: 'sq2',
      name: 'Al Kabib',
      manager: 'Kalled',
      stars: 5,
      primaryColor: '#be123c',
      secondaryColor: '#38bdf8',
      formation: '4-1-4-1 Árabe Ofensivo',
      captain: 'Mohamed Salah (91)',
      recentForm: ['W', 'W', 'W', 'D', 'W'],
      roster: [
        { id: 'p401', pos: 'GK', name: 'Ederson', ovr: 89 },
        { id: 'p402', pos: 'GK', name: 'Bono', ovr: 84 },
        { id: 'p403', pos: 'CB', name: 'Rudiger', ovr: 88 },
        { id: 'p404', pos: 'CB', name: 'Laporte', ovr: 86 },
        { id: 'p405', pos: 'CB', name: 'Upamecano', ovr: 84 },
        { id: 'p406', pos: 'LB', name: 'Nuno Mendes', ovr: 84 },
        { id: 'p407', pos: 'RB', name: 'Carvajal', ovr: 85 },
        { id: 'p408', pos: 'DMF', name: 'Kimmich', ovr: 90 },
        { id: 'p409', pos: 'CMF', name: 'Valverde', ovr: 87 },
        { id: 'p410', pos: 'CMF', name: 'Milinković-Savić', ovr: 86 },
        { id: 'p411', pos: 'AMF', name: 'Ødegaard', ovr: 86 },
        { id: 'p412', pos: 'LMF', name: 'Carrasco', ovr: 84 },
        { id: 'p413', pos: 'LWF', name: 'Rafael Leão', ovr: 87 },
        { id: 'p414', pos: 'RWF', name: 'Mohamed Salah', ovr: 91 },
        { id: 'p415', pos: 'RWF', name: 'Mahrez', ovr: 86 },
        { id: 'p416', pos: 'CF', name: 'Harry Kane', ovr: 90 },
        { id: 'p417', pos: 'CF', name: 'Gabriel Jesus', ovr: 85 },
        { id: 'p418', pos: 'SS', name: 'Nkunku', ovr: 86 },
      ],
    },
    {
      id: 'sq3',
      name: 'Frog FC',
      manager: 'Gian',
      stars: 4.5,
      primaryColor: '#16a34a',
      secondaryColor: '#2dd4bf',
      formation: '4-3-3 Ofensivo',
      captain: 'Robert Lewandowski (92)',
      recentForm: ['W', 'D', 'W', 'W', 'L'],
      roster: [
        { id: 'p501', pos: 'GK', name: 'Neuer', ovr: 90 },
        { id: 'p502', pos: 'GK', name: 'Musso', ovr: 82 },
        { id: 'p503', pos: 'CB', name: 'De Ligt', ovr: 87 },
        { id: 'p504', pos: 'CB', name: 'Alaba', ovr: 87 },
        { id: 'p505', pos: 'CB', name: 'Tomori', ovr: 84 },
        { id: 'p506', pos: 'LB', name: 'Lucas Hernández', ovr: 86 },
        { id: 'p507', pos: 'RB', name: 'Hakimi', ovr: 88 },
        { id: 'p508', pos: 'DMF', name: 'Declan Rice', ovr: 86 },
        { id: 'p509', pos: 'CMF', name: 'Kroos', ovr: 88 },
        { id: 'p510', pos: 'CMF', name: 'Gündoğan', ovr: 86 },
        { id: 'p511', pos: 'AMF', name: 'Thomas Müller', ovr: 87 },
        { id: 'p512', pos: 'AMF', name: 'Musiala', ovr: 85 },
        { id: 'p513', pos: 'LWF', name: 'Neymar Jr.', ovr: 91 },
        { id: 'p514', pos: 'RWF', name: 'Coman', ovr: 86 },
        { id: 'p515', pos: 'RWF', name: 'Sané', ovr: 85 },
        { id: 'p516', pos: 'CF', name: 'Lewandowski', ovr: 92 },
        { id: 'p517', pos: 'CF', name: 'Vlahović', ovr: 86 },
        { id: 'p518', pos: 'CF', name: 'Richarlison', ovr: 83 },
      ],
    },
    {
      id: 'sq4',
      name: 'Sorriso FC',
      manager: 'Enzo',
      stars: 4.5,
      primaryColor: '#0284c7',
      secondaryColor: '#7dd3fc',
      formation: '4-3-3 Tiki-Taka',
      captain: 'Jan Oblak (91)',
      recentForm: ['W', 'W', 'D', 'L', 'W'],
      roster: [
        { id: 'p601', pos: 'GK', name: 'Oblak', ovr: 91 },
        { id: 'p602', pos: 'GK', name: 'Unai Simón', ovr: 83 },
        { id: 'p603', pos: 'CB', name: 'Giménez', ovr: 85 },
        { id: 'p604', pos: 'CB', name: 'Pau Torres', ovr: 84 },
        { id: 'p605', pos: 'CB', name: 'Koundé', ovr: 86 },
        { id: 'p606', pos: 'LB', name: 'Acuña', ovr: 84 },
        { id: 'p607', pos: 'RB', name: 'Reece James', ovr: 86 },
        { id: 'p608', pos: 'DMF', name: 'Tchouaméni', ovr: 85 },
        { id: 'p609', pos: 'CMF', name: 'Frenkie de Jong', ovr: 87 },
        { id: 'p610', pos: 'CMF', name: 'Koke', ovr: 85 },
        { id: 'p611', pos: 'AMF', name: 'Phil Foden', ovr: 87 },
        { id: 'p612', pos: 'AMF', name: 'Mason Mount', ovr: 84 },
        { id: 'p613', pos: 'LWF', name: 'Sterling', ovr: 86 },
        { id: 'p614', pos: 'RWF', name: 'Saka', ovr: 86 },
        { id: 'p615', pos: 'RWF', name: 'Raphinha', ovr: 85 },
        { id: 'p616', pos: 'CF', name: 'Suárez', ovr: 87 },
        { id: 'p617', pos: 'CF', name: 'Darwin Núñez', ovr: 84 },
        { id: 'p618', pos: 'SS', name: 'Correa', ovr: 83 },
      ],
    },
    {
      id: 'sq5',
      name: 'Carvalhaes FC',
      manager: 'Carvalhaes',
      stars: 4.5,
      primaryColor: '#dc2626',
      secondaryColor: '#111827',
      formation: '4-2-3-1 Pressão Alta',
      captain: 'Zlatan Ibrahimović (88)',
      recentForm: ['W', 'L', 'W', 'D', 'W'],
      roster: [
        { id: 'p701', pos: 'GK', name: 'Ter Stegen', ovr: 89 },
        { id: 'p702', pos: 'GK', name: 'Cillessen', ovr: 80 },
        { id: 'p703', pos: 'CB', name: 'Thiago Silva', ovr: 87 },
        { id: 'p704', pos: 'CB', name: 'Pepe', ovr: 84 },
        { id: 'p705', pos: 'CB', name: 'Araújo', ovr: 86 },
        { id: 'p706', pos: 'LB', name: 'Alex Sandro', ovr: 83 },
        { id: 'p707', pos: 'RB', name: 'Trippier', ovr: 85 },
        { id: 'p708', pos: 'DMF', name: 'Busquets', ovr: 86 },
        { id: 'p709', pos: 'CMF', name: 'Pogba', ovr: 86 },
        { id: 'p710', pos: 'CMF', name: 'Vidal', ovr: 83 },
        { id: 'p711', pos: 'AMF', name: 'James Rodríguez', ovr: 84 },
        { id: 'p712', pos: 'LMF', name: 'Perišić', ovr: 85 },
        { id: 'p713', pos: 'LWF', name: 'Insigne', ovr: 85 },
        { id: 'p714', pos: 'RWF', name: 'Bale', ovr: 84 },
        { id: 'p715', pos: 'CF', name: 'Ibrahimović', ovr: 88 },
        { id: 'p716', pos: 'CF', name: 'Cavani', ovr: 85 },
        { id: 'p717', pos: 'CF', name: 'Džeko', ovr: 84 },
        { id: 'p718', pos: 'SS', name: 'Mertens', ovr: 84 },
      ],
    },
    {
      id: 'sq6',
      name: 'Beni FC',
      manager: 'Beni',
      stars: 4.5,
      primaryColor: '#881337',
      secondaryColor: '#fda4af',
      formation: '4-3-3 Ala Aberta',
      captain: 'Eden Hazard (87)',
      recentForm: ['W', 'D', 'L', 'W', 'W'],
      roster: [
        { id: 'p801', pos: 'GK', name: 'Maignan', ovr: 88 },
        { id: 'p802', pos: 'GK', name: 'Lloris', ovr: 85 },
        { id: 'p803', pos: 'CB', name: 'Hummels', ovr: 85 },
        { id: 'p804', pos: 'CB', name: 'Süle', ovr: 84 },
        { id: 'p805', pos: 'CB', name: 'Romero', ovr: 85 },
        { id: 'p806', pos: 'LB', name: 'Guerreiro', ovr: 85 },
        { id: 'p807', pos: 'RB', name: 'Alexander-Arnold', ovr: 88 },
        { id: 'p808', pos: 'DMF', name: 'Brozović', ovr: 86 },
        { id: 'p809', pos: 'CMF', name: 'Camavinga', ovr: 84 },
        { id: 'p810', pos: 'CMF', name: 'Tielemans', ovr: 84 },
        { id: 'p811', pos: 'AMF', name: 'Reus', ovr: 86 },
        { id: 'p812', pos: 'AMF', name: 'Havertz', ovr: 85 },
        { id: 'p813', pos: 'LWF', name: 'Hazard', ovr: 87 },
        { id: 'p814', pos: 'RWF', name: 'Gnabry', ovr: 86 },
        { id: 'p815', pos: 'RWF', name: 'Dembele', ovr: 85 },
        { id: 'p816', pos: 'CF', name: 'Immobile', ovr: 87 },
        { id: 'p817', pos: 'CF', name: 'Aubameyang', ovr: 86 },
        { id: 'p818', pos: 'SS', name: 'Depay', ovr: 85 },
      ],
    },
    {
      id: 'sq7',
      name: 'Crew FC',
      manager: 'Crew',
      stars: 4.5,
      primaryColor: '#0f172a',
      secondaryColor: '#38bdf8',
      formation: '4-4-2 Losango',
      captain: 'Jorginho (87)',
      recentForm: ['D', 'W', 'D', 'W', 'L'],
      roster: [
        { id: 'p901', pos: 'GK', name: 'Mendy', ovr: 86 },
        { id: 'p902', pos: 'GK', name: 'Pickford', ovr: 83 },
        { id: 'p903', pos: 'CB', name: 'Bonucci', ovr: 86 },
        { id: 'p904', pos: 'CB', name: 'Chiellini', ovr: 86 },
        { id: 'p905', pos: 'CB', name: 'Akanji', ovr: 84 },
        { id: 'p906', pos: 'LB', name: 'Spinazzola', ovr: 84 },
        { id: 'p907', pos: 'RB', name: 'Di Lorenzo', ovr: 84 },
        { id: 'p908', pos: 'DMF', name: 'Jorginho', ovr: 87 },
        { id: 'p909', pos: 'DMF', name: 'Tonali', ovr: 85 },
        { id: 'p910', pos: 'CMF', name: 'Locatelli', ovr: 84 },
        { id: 'p911', pos: 'AMF', name: 'Pellegrini', ovr: 85 },
        { id: 'p912', pos: 'LMF', name: 'Kostić', ovr: 84 },
        { id: 'p913', pos: 'LWF', name: 'Grealish', ovr: 85 },
        { id: 'p914', pos: 'RWF', name: 'Berardi', ovr: 84 },
        { id: 'p915', pos: 'CF', name: 'Giroud', ovr: 84 },
        { id: 'p916', pos: 'CF', name: 'Morata', ovr: 84 },
        { id: 'p917', pos: 'CF', name: 'Belotti', ovr: 82 },
        { id: 'p918', pos: 'SS', name: 'Raspadori', ovr: 81 },
      ],
    },
    {
      id: 'sq8',
      name: 'Mazili M.D FC',
      manager: 'Mazili',
      stars: 4.5,
      primaryColor: '#0369a1',
      secondaryColor: '#facc15',
      formation: '4-3-1-2 Posse de Bola',
      captain: 'Lionel Messi (93)',
      recentForm: ['W', 'W', 'L', 'W', 'D'],
      roster: [
        { id: 'p301', pos: 'GK', name: 'Alisson', ovr: 90 },
        { id: 'p302', pos: 'GK', name: 'Ospina', ovr: 81 },
        { id: 'p303', pos: 'CB', name: 'Koulibaly', ovr: 88 },
        { id: 'p304', pos: 'CB', name: 'Skriniar', ovr: 87 },
        { id: 'p305', pos: 'CB', name: 'Bastoni', ovr: 85 },
        { id: 'p306', pos: 'LB', name: 'Jordi Alba', ovr: 86 },
        { id: 'p307', pos: 'RB', name: 'Walker', ovr: 86 },
        { id: 'p308', pos: 'DMF', name: 'Rodri', ovr: 88 },
        { id: 'p309', pos: 'CMF', name: 'Barella', ovr: 87 },
        { id: 'p310', pos: 'CMF', name: 'Pedri', ovr: 86 },
        { id: 'p311', pos: 'CMF', name: 'Thiago Alcântara', ovr: 86 },
        { id: 'p312', pos: 'AMF', name: 'Lucas Paquetá', ovr: 84 },
        { id: 'p313', pos: 'LWF', name: 'Sadio Mané', ovr: 89 },
        { id: 'p314', pos: 'RWF', name: 'Messi', ovr: 93 },
        { id: 'p315', pos: 'CF', name: 'Lukaku', ovr: 88, loan: 'Empréstimo - Expira 26/07' },
        { id: 'p316', pos: 'CF', name: 'Lautaro Martínez', ovr: 87 },
        { id: 'p317', pos: 'SS', name: 'Griezmann', ovr: 86 },
        { id: 'p318', pos: 'CF', name: 'Osimhen', ovr: 85 },
      ],
    },
    {
      id: 'sq9',
      name: 'The Beatles',
      manager: 'Beatles',
      stars: 4,
      primaryColor: '#1e3a8a',
      secondaryColor: '#e2e8f0',
      formation: '4-2-2-2 Clássico',
      captain: 'Bruno Guimarães / Coutinho (86)',
      recentForm: ['W', 'L', 'L', 'W', 'W'],
      roster: [
        { id: 'p1001', pos: 'GK', name: 'Weverton', ovr: 84 },
        { id: 'p1002', pos: 'GK', name: 'Santos', ovr: 81 },
        { id: 'p1003', pos: 'CB', name: 'Gabriel Magalhães', ovr: 85 },
        { id: 'p1004', pos: 'CB', name: 'Bremer', ovr: 85 },
        { id: 'p1005', pos: 'CB', name: 'Gustavo Gómez', ovr: 84 },
        { id: 'p1006', pos: 'LB', name: 'Alex Telles', ovr: 83 },
        { id: 'p1007', pos: 'RB', name: 'Danilo', ovr: 84 },
        { id: 'p1008', pos: 'DMF', name: 'Bruno Guimarães', ovr: 86 },
        { id: 'p1009', pos: 'CMF', name: 'Fred', ovr: 83 },
        { id: 'p1010', pos: 'AMF', name: 'Coutinho', ovr: 85 },
        { id: 'p1011', pos: 'AMF', name: 'Arrascaeta', ovr: 85 },
        { id: 'p1012', pos: 'AMF', name: 'Everton Ribeiro', ovr: 82 },
        { id: 'p1013', pos: 'LWF', name: 'Gabriel Martinelli', ovr: 85 },
        { id: 'p1014', pos: 'RWF', name: 'Antony', ovr: 84 },
        { id: 'p1015', pos: 'RWF', name: 'Rodrygo', ovr: 85 },
        { id: 'p1016', pos: 'CF', name: 'Firmino', ovr: 85 },
        { id: 'p1017', pos: 'CF', name: 'Gabigol', ovr: 84 },
        { id: 'p1018', pos: 'CF', name: 'Pedro', ovr: 83 },
      ],
    },
    {
      id: 'sq10',
      name: 'Gustavo FC',
      manager: 'Gustavo',
      stars: 4.5,
      primaryColor: '#065f46',
      secondaryColor: '#cbd5e1',
      formation: '4-3-3 Ofensivo',
      captain: 'Kylian Mbappé (92)',
      recentForm: ['W', 'W', 'W', 'D', 'W'],
      roster: [
        { id: 'p101', pos: 'GK', name: 'Donnarumma', ovr: 89 },
        { id: 'p102', pos: 'GK', name: 'Keylor Navas', ovr: 86 },
        { id: 'p103', pos: 'CB', name: 'Van Dijk', ovr: 91 },
        { id: 'p104', pos: 'CB', name: 'Marquinhos', ovr: 88 },
        { id: 'p105', pos: 'CB', name: 'Kimpembe', ovr: 84 },
        { id: 'p106', pos: 'LB', name: 'Alphonso Davies', ovr: 86 },
        { id: 'p107', pos: 'RB', name: 'Robertson', ovr: 87 },
        { id: 'p108', pos: 'RB', name: 'Pavard', ovr: 83 },
        { id: 'p109', pos: 'DMF', name: 'Casemiro', ovr: 89 },
        { id: 'p110', pos: 'CMF', name: 'Verratti', ovr: 88, loan: 'Empréstimo - Expira 26/07' },
        { id: 'p111', pos: 'CMF', name: 'Goretzka', ovr: 87 },
        { id: 'p112', pos: 'AMF', name: 'De Bruyne', ovr: 92 },
        { id: 'p113', pos: 'AMF', name: 'Bruno Fernandes', ovr: 88 },
        { id: 'p114', pos: 'LWF', name: 'Vinícius Jr.', ovr: 88 },
        { id: 'p115', pos: 'RWF', name: 'Pavón', ovr: 82 },
        { id: 'p116', pos: 'CF', name: 'Mbappé', ovr: 92 },
        { id: 'p117', pos: 'CF', name: 'Benzema', ovr: 90 },
        { id: 'p118', pos: 'SS', name: 'João Félix', ovr: 85 },
      ],
    },
    {
      id: 'sq11',
      name: 'Ashen Lords',
      manager: 'Ashen',
      stars: 4,
      primaryColor: '#c2410c',
      secondaryColor: '#fdba74',
      formation: '5-3-2 Muralha de Fogo',
      captain: 'Sergio Ramos (88)',
      recentForm: ['D', 'D', 'W', 'D', 'W'],
      roster: [
        { id: 'p1101', pos: 'GK', name: 'De Gea', ovr: 87 },
        { id: 'p1102', pos: 'GK', name: 'Rui Patrício', ovr: 82 },
        { id: 'p1103', pos: 'CB', name: 'Sergio Ramos', ovr: 88 },
        { id: 'p1104', pos: 'CB', name: 'Piqué', ovr: 85 },
        { id: 'p1105', pos: 'CB', name: 'Otamendi', ovr: 83 },
        { id: 'p1106', pos: 'LB', name: 'Marcos Alonso', ovr: 82 },
        { id: 'p1107', pos: 'RB', name: 'Azpilicueta', ovr: 84 },
        { id: 'p1108', pos: 'DMF', name: 'Partey', ovr: 85 },
        { id: 'p1109', pos: 'DMF', name: 'Ndidi', ovr: 84 },
        { id: 'p1110', pos: 'CMF', name: 'Kessié', ovr: 84 },
        { id: 'p1111', pos: 'CMF', name: 'Wijnaldum', ovr: 84 },
        { id: 'p1112', pos: 'AMF', name: 'Eriksen', ovr: 85 },
        { id: 'p1113', pos: 'LWF', name: 'Rashford', ovr: 86 },
        { id: 'p1114', pos: 'RWF', name: 'Ziyech', ovr: 84 },
        { id: 'p1115', pos: 'CF', name: 'Jamie Vardy', ovr: 85 },
        { id: 'p1116', pos: 'CF', name: 'Raúl Jiménez', ovr: 83 },
        { id: 'p1117', pos: 'CF', name: 'Zapata', ovr: 84 },
        { id: 'p1118', pos: 'SS', name: 'Muriel', ovr: 83 },
      ],
    },
    {
      id: 'sq12',
      name: 'Fabricio FC',
      manager: 'Fabricio',
      stars: 4,
      primaryColor: '#d97706',
      secondaryColor: '#fde68a',
      formation: '4-3-3 Velocidade',
      captain: 'Wojciech Szczęsny (87)',
      recentForm: ['W', 'L', 'W', 'L', 'W'],
      roster: [
        { id: 'p1201', pos: 'GK', name: 'Szczęsny', ovr: 87 },
        { id: 'p1202', pos: 'GK', name: 'Perin', ovr: 80 },
        { id: 'p1203', pos: 'CB', name: 'De Vrij', ovr: 86 },
        { id: 'p1204', pos: 'CB', name: 'Schlotterbeck', ovr: 83 },
        { id: 'p1205', pos: 'CB', name: 'Christensen', ovr: 84 },
        { id: 'p1206', pos: 'LB', name: 'Grimaldo', ovr: 84 },
        { id: 'p1207', pos: 'RB', name: 'Dumfries', ovr: 84 },
        { id: 'p1208', pos: 'DMF', name: 'Bennacer', ovr: 84 },
        { id: 'p1209', pos: 'CMF', name: 'Rabiot', ovr: 84 },
        { id: 'p1210', pos: 'CMF', name: 'Zielinski', ovr: 84 },
        { id: 'p1211', pos: 'AMF', name: 'Çalhanoğlu', ovr: 85 },
        { id: 'p1212', pos: 'RMF', name: 'Cuadrado', ovr: 84 },
        { id: 'p1213', pos: 'LWF', name: 'Kvaratskhelia', ovr: 85 },
        { id: 'p1214', pos: 'LWF', name: 'Lozano', ovr: 83 },
        { id: 'p1215', pos: 'RWF', name: 'Diaby', ovr: 84 },
        { id: 'p1216', pos: 'CF', name: 'Abraham', ovr: 84 },
        { id: 'p1217', pos: 'CF', name: 'Arnautović', ovr: 82 },
        { id: 'p1218', pos: 'SS', name: 'Zaniolo', ovr: 82 },
      ],
    },
    {
      id: 'sq13',
      name: 'Cannabis Crew',
      manager: 'Cannabis',
      stars: 4,
      primaryColor: '#15803d',
      secondaryColor: '#a855f7',
      formation: '4-2-3-1 Equilibrado',
      captain: 'Dani Parejo (86)',
      recentForm: ['L', 'D', 'W', 'W', 'D'],
      roster: [
        { id: 'p1301', pos: 'GK', name: 'Sommer', ovr: 86 },
        { id: 'p1302', pos: 'GK', name: 'Remiro', ovr: 82 },
        { id: 'p1303', pos: 'CB', name: 'Albiol', ovr: 84 },
        { id: 'p1304', pos: 'CB', name: 'Íñigo Martínez', ovr: 84 },
        { id: 'p1305', pos: 'CB', name: 'Le Normand', ovr: 83 },
        { id: 'p1306', pos: 'LB', name: 'Gayà', ovr: 84 },
        { id: 'p1307', pos: 'RB', name: 'Jesús Navas', ovr: 84 },
        { id: 'p1308', pos: 'DMF', name: 'Guido Rodríguez', ovr: 83 },
        { id: 'p1309', pos: 'CMF', name: 'Parejo', ovr: 86 },
        { id: 'p1310', pos: 'CMF', name: 'Mikel Merino', ovr: 84 },
        { id: 'p1311', pos: 'AMF', name: 'Fekir', ovr: 85 },
        { id: 'p1312', pos: 'AMF', name: 'Canales', ovr: 84 },
        { id: 'p1313', pos: 'LWF', name: 'Oyarzabal', ovr: 85 },
        { id: 'p1314', pos: 'LWF', name: 'Danjuma', ovr: 83 },
        { id: 'p1315', pos: 'RWF', name: 'Asensio', ovr: 84 },
        { id: 'p1316', pos: 'CF', name: 'Gerard Moreno', ovr: 86 },
        { id: 'p1317', pos: 'CF', name: 'Iago Aspas', ovr: 85 },
        { id: 'p1318', pos: 'CF', name: 'Borja Iglesias', ovr: 83 },
      ],
    },
    {
      id: 'sq14',
      name: 'Justin FC',
      manager: 'Justin',
      stars: 4,
      primaryColor: '#1d4ed8',
      secondaryColor: '#facc15',
      formation: '4-4-2 Linha Dupla',
      captain: 'Marcos Llorente (86)',
      recentForm: ['W', 'W', 'D', 'L', 'D'],
      roster: [
        { id: 'p1401', pos: 'GK', name: 'Bounou', ovr: 85 },
        { id: 'p1402', pos: 'GK', name: 'Rulli', ovr: 82 },
        { id: 'p1403', pos: 'CB', name: 'Savić', ovr: 85 },
        { id: 'p1404', pos: 'CB', name: 'Diego Carlos', ovr: 84 },
        { id: 'p1405', pos: 'CB', name: 'Felipe', ovr: 83 },
        { id: 'p1406', pos: 'LB', name: 'Reinildo', ovr: 83 },
        { id: 'p1407', pos: 'RB', name: 'Molina', ovr: 82 },
        { id: 'p1408', pos: 'DMF', name: 'Kondogbia', ovr: 83 },
        { id: 'p1409', pos: 'CMF', name: 'Marcos Llorente', ovr: 86 },
        { id: 'p1410', pos: 'CMF', name: 'De Paul', ovr: 85 },
        { id: 'p1411', pos: 'AMF', name: 'Lemar', ovr: 84 },
        { id: 'p1412', pos: 'RMF', name: 'Soler', ovr: 83 },
        { id: 'p1413', pos: 'LWF', name: 'Ferran Torres', ovr: 84 },
        { id: 'p1414', pos: 'LWF', name: 'Ansu Fati', ovr: 83 },
        { id: 'p1415', pos: 'RWF', name: 'Ángel Correa', ovr: 84 },
        { id: 'p1416', pos: 'CF', name: 'Matheus Cunha', ovr: 82 },
        { id: 'p1417', pos: 'CF', name: 'En-Nesyri', ovr: 82 },
        { id: 'p1418', pos: 'SS', name: 'Guedes', ovr: 83 },
      ],
    },
    {
      id: 'sq15',
      name: 'Augusto FC',
      manager: 'Augusto',
      stars: 4,
      primaryColor: '#334155',
      secondaryColor: '#f8fafc',
      formation: '4-1-2-1-2 Estreito',
      captain: 'Dimitri Payet (85)',
      recentForm: ['L', 'W', 'D', 'W', 'L'],
      roster: [
        { id: 'p1501', pos: 'GK', name: 'Schmeichel', ovr: 84 },
        { id: 'p1502', pos: 'GK', name: 'Mandanda', ovr: 81 },
        { id: 'p1503', pos: 'CB', name: 'Saliba', ovr: 84 },
        { id: 'p1504', pos: 'CB', name: 'Fofana', ovr: 83 },
        { id: 'p1505', pos: 'CB', name: 'Fonte', ovr: 82 },
        { id: 'p1506', pos: 'LB', name: 'Tagliafico', ovr: 83 },
        { id: 'p1507', pos: 'RB', name: 'Clauss', ovr: 82 },
        { id: 'p1508', pos: 'DMF', name: 'Guendouzi', ovr: 82 },
        { id: 'p1509', pos: 'CMF', name: 'Seko Fofana', ovr: 83 },
        { id: 'p1510', pos: 'CMF', name: 'Renato Sanches', ovr: 83 },
        { id: 'p1511', pos: 'AMF', name: 'Payet', ovr: 84 },
        { id: 'p1512', pos: 'AMF', name: 'Aouar', ovr: 82 },
        { id: 'p1513', pos: 'LWF', name: 'Bamba', ovr: 81 },
        { id: 'p1514', pos: 'RWF', name: 'Bourigeaud', ovr: 82 },
        { id: 'p1515', pos: 'CF', name: 'Ben Yedder', ovr: 85 },
        { id: 'p1516', pos: 'CF', name: 'Lacazette', ovr: 84 },
        { id: 'p1517', pos: 'CF', name: 'Jonathan David', ovr: 83 },
        { id: 'p1518', pos: 'SS', name: 'Gouiri', ovr: 82 },
      ],
    },
    {
      id: 'sq16',
      name: 'Adevogados FC',
      manager: 'Adevogados',
      stars: 4,
      primaryColor: '#ca8a04',
      secondaryColor: '#fef08a',
      formation: '3-4-1-2 Jurídico',
      captain: 'Samir Handanovič (85)',
      recentForm: ['W', 'D', 'W', 'L', 'D'],
      roster: [
        { id: 'p1601', pos: 'GK', name: 'Handanovič', ovr: 85 },
        { id: 'p1602', pos: 'GK', name: 'Onana', ovr: 83 },
        { id: 'p1603', pos: 'CB', name: 'Acerbi', ovr: 83 },
        { id: 'p1604', pos: 'CB', name: 'Smalling', ovr: 83 },
        { id: 'p1605', pos: 'CB', name: 'Kalulu', ovr: 82 },
        { id: 'p1606', pos: 'LB', name: 'Gosens', ovr: 83 },
        { id: 'p1607', pos: 'RB', name: 'Calabria', ovr: 82 },
        { id: 'p1608', pos: 'DMF', name: 'Cristante', ovr: 82 },
        { id: 'p1609', pos: 'CMF', name: 'Mkhitaryan', ovr: 83 },
        { id: 'p1610', pos: 'CMF', name: 'Fabián Ruiz', ovr: 84 },
        { id: 'p1611', pos: 'AMF', name: 'Luis Alberto', ovr: 85 },
        { id: 'p1612', pos: 'AMF', name: 'Brahim Díaz', ovr: 81 },
        { id: 'p1613', pos: 'LWF', name: 'Pedro Rodríguez', ovr: 82 },
        { id: 'p1614', pos: 'RWF', name: 'Politano', ovr: 82 },
        { id: 'p1615', pos: 'RWF', name: 'Felipe Anderson', ovr: 82 },
        { id: 'p1616', pos: 'CF', name: 'Scamacca', ovr: 82 },
        { id: 'p1617', pos: 'CF', name: 'Jović', ovr: 81 },
        { id: 'p1618', pos: 'SS', name: 'Iličić', ovr: 82 },
      ],
    },
    {
      id: 'sq17',
      name: 'Panissa FC',
      manager: 'Panissa',
      stars: 4,
      primaryColor: '#b91c1c',
      secondaryColor: '#f59e0b',
      formation: '4-2-3-1 Ofensivo',
      captain: 'Jude Bellingham (86)',
      recentForm: ['D', 'W', 'L', 'W', 'W'],
      roster: [
        { id: 'p1701', pos: 'GK', name: 'Trapp', ovr: 86 },
        { id: 'p1702', pos: 'GK', name: 'Casteels', ovr: 85 },
        { id: 'p1703', pos: 'CB', name: 'Ginter', ovr: 84 },
        { id: 'p1704', pos: 'CB', name: 'Tah', ovr: 83 },
        { id: 'p1705', pos: 'CB', name: 'Orban', ovr: 83 },
        { id: 'p1706', pos: 'LB', name: 'Angelino', ovr: 83 },
        { id: 'p1707', pos: 'RB', name: 'Frimpong', ovr: 83 },
        { id: 'p1708', pos: 'DMF', name: 'Laimer', ovr: 83 },
        { id: 'p1709', pos: 'CMF', name: 'Bellingham', ovr: 86 },
        { id: 'p1710', pos: 'CMF', name: 'Sabitzer', ovr: 83 },
        { id: 'p1711', pos: 'AMF', name: 'Wirtz', ovr: 84 },
        { id: 'p1712', pos: 'AMF', name: 'Dani Olmo', ovr: 84 },
        { id: 'p1713', pos: 'LMF', name: 'Hofmann', ovr: 83 },
        { id: 'p1714', pos: 'RWF', name: 'Adeyemi', ovr: 81 },
        { id: 'p1715', pos: 'CF', name: 'Schick', ovr: 85 },
        { id: 'p1716', pos: 'CF', name: 'Haller', ovr: 84 },
        { id: 'p1717', pos: 'CF', name: 'André Silva', ovr: 83 },
        { id: 'p1718', pos: 'SS', name: 'Kramarić', ovr: 83 },
      ],
    },
  ];

  const $ = (sel) => document.querySelector(sel);
  const uid = () => Math.random().toString(36).slice(2, 10);
  const norm = (s) => String(s || '').trim().toLowerCase();
  const escapeHtml = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const MAX_SUBSTITUTES = 5;
  const MAX_SQUAD_SIZE = 11 + MAX_SUBSTITUTES; // 11 Titulares + 5 Reservas = 16 atletas

  /** Garante que cada clube respeite o limite de 11 titulares + até 5 reservas (16 jogadores) e possua `badge_url` */
  function normalizeSquadRosterLimit(clubsList) {
    if (!Array.isArray(clubsList)) return [];
    let modified = false;
    clubsList.forEach((club) => {
      ['kit_home_3d_url', 'kit_away_3d_url'].forEach((field) => {
        if (typeof club[field] !== 'string') { club[field] = ''; modified = true; }
      });
      if (typeof club.badge_url !== 'string') {
        club.badge_url = typeof club.shield_image === 'string' ? club.shield_image : '';
        modified = true;
      }
      if (typeof club.shield_image !== 'string') {
        club.shield_image = club.badge_url || '';
        modified = true;
      }
      if (Array.isArray(club.roster) && club.roster.length > MAX_SQUAD_SIZE) {
        club.roster = club.roster.slice(0, MAX_SQUAD_SIZE);
        if (Array.isArray(club.starterIds)) {
          const validIds = new Set(club.roster.map((p) => p.id));
          club.starterIds = club.starterIds.filter((id) => validIds.has(id));
        }
        modified = true;
      }
    });

    return clubsList;
  }

  /* ---------- Persistência ---------- */
  function readSquads() {
    try {
      const raw = GBLShared.getItem(SQUADS_KEY);
      if (!raw) {
        const seeded = normalizeSquadRosterLimit(JSON.parse(JSON.stringify(DEFAULT_SQUADS)));
        GBLShared.setItem(SQUADS_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return normalizeSquadRosterLimit(JSON.parse(raw));
    } catch {
      return normalizeSquadRosterLimit(JSON.parse(JSON.stringify(DEFAULT_SQUADS)));
    }
  }

  function writeSquads(list) {
    window.GBLTeams ? window.GBLTeams.save(list) : GBLShared.setItem(SQUADS_KEY, JSON.stringify(list));
  }

  function getClubTradeAndReserveMetrics(clubName) {
    let maxTrades = 3;
    let reserves = 5;
    let usedTrades = 0;

    try {
      const clubs = JSON.parse(GBLShared.getItem(CLUBS_KEY) || '[]');
      const found = clubs.find((c) => norm(c.name) === norm(clubName));
      if (found) {
        maxTrades = Number(found.maxTrades) || 3;
        reserves = found.reserves ?? 5;
      }
    } catch {}

    try {
      const transfers = JSON.parse(GBLShared.getItem(TRANSFERS_KEY) || '[]');
      transfers.forEach((tr) => {
        if (norm(tr.teamA) === norm(clubName) || norm(tr.teamB) === norm(clubName)) {
          usedTrades++;
        }
      });
    } catch {}

    const availTrades = Math.max(0, maxTrades - usedTrades);
    return { availTrades, maxTrades, reserves };
  }

  /** Verifica se o jogador possui empréstimo ativo registado no feed de transferências */
  function getActiveLoanBadgeFromTransfers(clubName, playerName) {
    try {
      const transfers = JSON.parse(GBLShared.getItem(TRANSFERS_KEY) || '[]');
      for (const tr of transfers) {
        if (tr.type !== 'emprestimo') continue;
        const involvesClub = norm(tr.teamA) === norm(clubName) || norm(tr.teamB) === norm(clubName);
        if (!involvesClub) continue;
        const allAssets = [...(tr.assetsA || []), ...(tr.assetsB || [])];
        if (allAssets.some((a) => norm(a) === norm(playerName))) {
          if (tr.expiryDate) {
            const [, m, d] = tr.expiryDate.split('-');
            if (d && m) return `Empréstimo - Expira ${d}/${m}`;
          }
          return 'Empréstimo Ativo';
        }
      }
    } catch {}
    return '';
  }

  /* ---------- Estado ---------- */
  const state = {
    currentIndex: Math.max(0,readSquads().findIndex(t=>t.id===new URLSearchParams(location.search).get('team'))),
    selectedPlayerId: null, // Jogador em foco no topo (Spotlight + Radar)
    swapSourceId: null,     // ID do jogador aguardando substituição (Titular <-> Reserva)
  };

  /* Coordenadas relativas: [posição PES, esquerda %, topo %]. */
  const FORMATION_PRESETS = Object.fromEntries(Object.entries({
    '4-3-3': [['GK',50,88], ['LB',14,70], ['CB',38,70], ['CB',62,70], ['RB',86,70], ['DMF',50,53], ['CMF',30,37], ['CMF',70,37], ['LWF',18,18], ['CF',50,14], ['RWF',82,18]],
    '4-2-1-3': [['GK',50,88], ['LB',14,70], ['CB',38,70], ['CB',62,70], ['RB',86,70], ['DMF',34,53], ['DMF',66,53], ['AMF',50,35], ['LWF',18,18], ['CF',50,14], ['RWF',82,18]],
    '4-4-2': [['GK',50,88], ['LB',14,70], ['CB',38,70], ['CB',62,70], ['RB',86,70], ['LMF',14,43], ['CMF',38,43], ['CMF',62,43], ['RMF',86,43], ['CF',35,18], ['CF',65,18]],
    '3-5-2': [['GK',50,88], ['CB',25,70], ['CB',50,70], ['CB',75,70], ['LMF',14,43], ['DMF',50,55], ['CMF',34,36], ['CMF',66,36], ['RMF',86,43], ['CF',35,16], ['CF',65,16]],
    '4-2-3-1': [['GK',50,88], ['LB',14,70], ['CB',38,70], ['CB',62,70], ['RB',86,70], ['DMF',34,53], ['DMF',66,53], ['LMF',18,32], ['AMF',50,32], ['RMF',82,32], ['CF',50,13]],
    '5-3-2': [['GK',50,88], ['LB',12,65], ['CB',31,72], ['CB',50,72], ['CB',69,72], ['RB',88,65], ['CMF',25,43], ['DMF',50,48], ['CMF',75,43], ['CF',35,18], ['CF',65,18]],
    '4-1-4-1': [['GK',50,88], ['LB',14,70], ['CB',38,70], ['CB',62,70], ['RB',86,70], ['DMF',50,53], ['LMF',14,33], ['CMF',38,33], ['CMF',62,33], ['RMF',86,33], ['CF',50,13]],
    '4-3-1-2': [['GK',50,88], ['LB',14,70], ['CB',38,70], ['CB',62,70], ['RB',86,70], ['CMF',25,49], ['DMF',50,54], ['CMF',75,49], ['AMF',50,32], ['CF',35,14], ['CF',65,14]],
    '4-2-2-2': [['GK',50,88], ['LB',14,70], ['CB',38,70], ['CB',62,70], ['RB',86,70], ['DMF',34,53], ['DMF',66,53], ['AMF',28,33], ['AMF',72,33], ['CF',35,14], ['CF',65,14]],
    '4-1-2-1-2': [['GK',50,88], ['LB',14,70], ['CB',38,70], ['CB',62,70], ['RB',86,70], ['DMF',50,55], ['CMF',25,43], ['CMF',75,43], ['AMF',50,31], ['CF',35,13], ['CF',65,13]],
    '3-4-1-2': [['GK',50,88], ['CB',25,70], ['CB',50,70], ['CB',75,70], ['LMF',14,47], ['CMF',38,49], ['CMF',62,49], ['RMF',86,47], ['AMF',50,31], ['CF',35,13], ['CF',65,13]],
  }).map(([key, positions]) => [key, positions.map(([role, left, top], index) => ({
    id: index + 1, role, left: `${left}%`, top: `${top}%`,
  }))]));

  function getFormationKey(formation) {
    const code = String(formation || '').match(/\b\d(?:\s*[-–]\s*\d){2,4}\b/)?.[0].replace(/\s/g, '').replace(/–/g, '-');
    // O texto legado "4-4-2 Losango" representa o meio-campo em diamante.
    if (code === '4-4-2' && /losango/i.test(formation)) return '4-1-2-1-2';
    return Object.hasOwn(FORMATION_PRESETS, code) ? code : '4-3-3';
  }

  const POSITION_LABELS = { GK: 'GK', LB: 'LE', CB: 'ZAG', RB: 'LD', DMF: 'VOL', CMF: 'MC', AMF: 'MAT', LMF: 'ME', RMF: 'MD', LWF: 'PTE', RWF: 'PTD', SS: 'SA', CF: 'CA' };

  function abbreviatePlayerName(name) {
    const words = String(name || '').trim().split(/\s+/);
    return words.length > 1 ? `${words[0][0]}. ${words.slice(1).join(' ')}` : words[0];
  }

  function canManageFormation(club) {
    if (typeof RBAC === 'undefined') return false;
    if(RBAC.getCurrentUser?.()?.status==='pending_approval')return false;
    return RBAC.isAdmin() || RBAC.getProfile()?.team_id === club.id;
  }

  // Reserva primeiro todas as correspondências exatas, antes de improvisar atletas.
  function assignPlayersToFormation(roster, slots) {
    const available = [...roster].sort((a, b) => (Number(b.ovr) || 0) - (Number(a.ovr) || 0));
    const assigned = Array(slots.length).fill(null);
    const take = (index, predicate) => {
      const candidate = available.findIndex(predicate);
      if (candidate >= 0) assigned[index] = available.splice(candidate, 1)[0];
    };
    slots.forEach((slot, index) => take(index, (p) => p.pos === slot.role));
    slots.forEach((slot, index) => {
      if (!assigned[index]) take(index, (p) => p.pos !== 'GK' && getPosGroupClass(p.pos) === getPosGroupClass(slot.role));
    });
    slots.forEach((slot, index) => {
      if (!assigned[index]) take(index, (p) => slot.role === 'GK' || p.pos !== 'GK');
    });
    return assigned;
  }

  $('#squadFormationSelect')?.addEventListener('change', (event) => {
    if(RBAC.isGuest?.()){RBAC.requireMember();renderSquadsHub();return;}
    const squads = readSquads();
    const club = squads[state.currentIndex];
    const formation = event.target.value;
    if (!club || !canManageFormation(club) || !Object.hasOwn(FORMATION_PRESETS, formation)) return;

    // Mantém os onze escolhidos e os redistribui pelas posições do novo esquema.
    const { starters } = splitStartersAndSubs(club);
    club.starterIds = assignPlayersToFormation(starters, FORMATION_PRESETS[formation]).filter(Boolean).map((p) => p.id);
    club.starterFormation = formation;
    club.formation = formation;
    writeSquads(squads);
    let clubs = [];
    try { clubs = JSON.parse(GBLShared.getItem(CLUBS_KEY) || '[]'); } catch {}
    if (!Array.isArray(clubs)) clubs = [];
    const linkedClub = clubs.find((c) => c.id === club.id || norm(c.name) === norm(club.name));
    if (linkedClub) {
      linkedClub.formation = formation;
      GBLShared.setItem(CLUBS_KEY, JSON.stringify(clubs));
    }
    if ($('#sqMetaFormation')) $('#sqMetaFormation').value = formation;
    window.dispatchEvent(new CustomEvent('gbl:datachange'));
  });

  /* ---------- Helpers Visuais ---------- */
  function getInitials(teamName) {
    const words = String(teamName || '')
      .replace(/\b(fc|sc|ec|ac|md|cf|de|da|do)\b/gi, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!words.length) return 'GB';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  function renderStars(starsCount) {
    const val = Number(starsCount) || 4;
    const full = Math.floor(val);
    const half = val - full >= 0.5 ? 1 : 0;
    const empty = Math.max(0, 5 - full - half);
    return (
      '<span class="star-full">' + '★'.repeat(full) + '</span>' +
      (half ? '<span class="star-half">★</span>' : '') +
      '<span class="star-empty">' + '☆'.repeat(empty) + '</span>'
    );
  }
  window.GBLRenderStars = renderStars;

  /**
   * Renderiza o Uniforme (Camisa + Calção) em Perspectiva 3D mapeando a textura oficial do PES
   * (ou imagem customizada) sobre o manequim 3D com dobras de tecido, iluminação volumétrica e sombra projetada.
   */
  function getOvrTierClass(ovr) {
    const n = Number(ovr) || 80;
    if (n >= 88) return 'ovr-worldclass';
    if (n >= 83) return 'ovr-gold';
    if (n >= 78) return 'ovr-silver';
    return 'ovr-bronze';
  }

  function getPosGroupClass(pos) {
    const p = String(pos || '').toUpperCase();
    if (p === 'GK') return 'pos-gk';
    if (['CB', 'LB', 'RB'].includes(p)) return 'pos-def';
    if (['DMF', 'CMF', 'AMF', 'LMF', 'RMF'].includes(p)) return 'pos-mid';
    return 'pos-fwd';
  }

  /** Camisa SVG para os 11 jogadores no gramado (estilo listrado/detalhado FIFA) */
  function renderPitchJerseySvg(primary, secondary, isGK) {
    const main = isGK ? '#16a34a' : primary || '#f8fafc';
    const stripe = isGK ? '#86efac' : secondary || '#0f172a';
    return `
      <svg class="pitch-jersey-svg" viewBox="0 0 64 60" width="48" height="45" aria-hidden="true">
        <path d="M18 5 L26 5 C28 10 36 10 38 5 L46 5 L58 17 L50 27 L44 22 L44 55 L20 55 L20 22 L14 27 L6 17 Z"
              fill="${escapeHtml(main)}" stroke="#0b132b" stroke-width="2.4" stroke-linejoin="round"/>
        ${
          isGK
            ? `<rect x="24" y="18" width="16" height="6" rx="2" fill="${escapeHtml(stripe)}" opacity="0.85"/>`
            : `<rect x="25" y="7" width="4.5" height="47" fill="${escapeHtml(stripe)}" opacity="0.9"/>
               <rect x="34.5" y="7" width="4.5" height="47" fill="${escapeHtml(stripe)}" opacity="0.9"/>`
        }
        <path d="M26 5 C28 10 36 10 38 5" fill="none" stroke="#ffffff" stroke-width="2.5"/>
        <path d="M14 27 L20 22 M50 27 L44 22" stroke="${escapeHtml(stripe)}" stroke-width="3"/>
      </svg>`;
  }

  /** Silhueta/Retrato estilizado do jogador para o Spotlight e Banco de Reservas */
  function renderPlayerAvatarSvg(primary, secondary, pos) {
    const shirt = pos === 'GK' ? '#16a34a' : primary || '#22e07a';
    const trim = secondary || '#f5c84c';
    return `
      <svg class="fifa-avatar-svg" viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="27" r="14" fill="#eab68c" stroke="#1e293b" stroke-width="1.8"/>
        <path d="M26 24 C26 14 54 14 54 24 C50 19 30 19 26 24 Z" fill="#1e293b"/>
        <circle cx="35" cy="27" r="1.6" fill="#0f172a"/>
        <circle cx="45" cy="27" r="1.6" fill="#0f172a"/>
        <path d="M36 34 Q40 36 44 34" fill="none" stroke="#7c2d12" stroke-width="1.6" stroke-linecap="round"/>
        <rect x="35" y="39" width="10" height="8" rx="3" fill="#dfa67b"/>
        <path d="M16 76 C17 53 27 45 40 45 C53 45 63 53 64 76 Z" fill="${escapeHtml(shirt)}" stroke="#0f172a" stroke-width="2"/>
        <path d="M31 46 L40 56 L49 46" fill="none" stroke="${escapeHtml(trim)}" stroke-width="3.5" stroke-linejoin="round"/>
      </svg>`;
  }

  function getPosDotColor(pos) {
    const p = String(pos || '').toUpperCase();
    if (p === 'GK') return '#f5c84c';
    if (['CB', 'LB', 'RB'].includes(p)) return '#facc15';
    if (['DMF', 'CMF', 'AMF', 'LMF', 'RMF'].includes(p)) return '#22e07a';
    return '#3b82f6';
  }

  /**
   * Divide o elenco do clube entre os 11 Titulares (ordenados para as 11 posições do campo)
   * e até 5 Reservas (MAX_SUBSTITUTES = 5). Se o clube já tiver `starterIds` salvo com 11 IDs válidos, respeita a escolha!
   */
  function splitStartersAndSubs(club) {
    const roster = Array.isArray(club.roster) ? club.roster : [];
    if (!roster.length) return { starters: [], subs: [] };

    const byId = new Map(roster.map((p) => [p.id, p]));

    if (Array.isArray(club.starterIds) && club.starterIds.length === Math.min(11, roster.length)) {
      let customStarters = club.starterIds.map((id) => byId.get(id)).filter(Boolean);
      if (customStarters.length === Math.min(11, roster.length) && new Set(club.starterIds).size === customStarters.length) {
        const formation = getFormationKey(club.formation);
        // Também redistribui titulares quando a formação muda nos modais de gestão.
        const lineup = (club.starterFormation || '4-3-3') !== formation || customStarters.length < 11
          ? assignPlayersToFormation(customStarters, FORMATION_PRESETS[formation])
          : customStarters;
        customStarters = lineup.filter(Boolean);
        const starterSet = new Set(customStarters.map((p) => p.id));
        const subs = roster.filter((p) => !starterSet.has(p.id)).slice(0, MAX_SUBSTITUTES);
        return { starters: customStarters, subs, lineup };
      }
    }

    const lineup = assignPlayersToFormation(roster, FORMATION_PRESETS[getFormationKey(club.formation)]);
    const starters = lineup.filter(Boolean);
    const usedIds = new Set(starters.map((p) => p.id));
    const subs = roster.filter((p) => !usedIds.has(p.id)).slice(0, MAX_SUBSTITUTES);
    return { starters, subs, lineup };
  }

  /** Realiza a substituição entre dois jogadores (Titular <-> Reserva ou posição no campo) */
  function swapPlayersInClub(playerIdA, playerIdB) {
    if (!playerIdA || !playerIdB || playerIdA === playerIdB) return;
    const squads = readSquads();
    const club = squads[state.currentIndex];
    if (!club || !Array.isArray(club.roster)) return;

    const { starters } = splitStartersAndSubs(club);
    const currentStarterIds = starters.map((p) => p.id);

    const idxA = currentStarterIds.indexOf(playerIdA);
    const idxB = currentStarterIds.indexOf(playerIdB);

    if (idxA !== -1 && idxB !== -1) {
      const temp = currentStarterIds[idxA];
      currentStarterIds[idxA] = currentStarterIds[idxB];
      currentStarterIds[idxB] = temp;
    } else if (idxA !== -1 && idxB === -1) {
      currentStarterIds[idxA] = playerIdB;
    } else if (idxA === -1 && idxB !== -1) {
      currentStarterIds[idxB] = playerIdA;
    } else {
      return;
    }

    club.starterIds = currentStarterIds;
    club.starterFormation = getFormationKey(club.formation);
    writeSquads(squads);

    const pA = club.roster.find((p) => p.id === playerIdA);
    const pB = club.roster.find((p) => p.id === playerIdB);
    state.selectedPlayerId = playerIdB;
    state.swapSourceId = null;
    renderSquadsHub();
    if (pA && pB) {
      showToast(`⇄ Substituição realizada: ${pA.name} ⇄ ${pB.name}`, 'info');
    }
  }

  /* ---------- Renderização Completa das 2 Colunas (Elencos) ---------- */
  function renderSquadsHub() {
    const squads = readSquads();
    if (!squads.length) return;

    if (state.currentIndex < 0) state.currentIndex = squads.length - 1;
    if (state.currentIndex >= squads.length) state.currentIndex = 0;

    const club = squads[state.currentIndex];
    const roster = club.roster || [];
    const { starters, subs, lineup = [] } = splitStartersAndSubs(club);
    const admin = typeof RBAC !== 'undefined' ? RBAC.isAdmin() : true;

    if (!state.selectedPlayerId || !roster.some((p) => p.id === state.selectedPlayerId)) {
      const bestStarter = [...starters].sort((a, b) => (Number(b.ovr) || 0) - (Number(a.ovr) || 0))[0] || roster[0];
      state.selectedPlayerId = bestStarter?.id || null;
      state.swapSourceId = null;
    }
    const selectedPlayer = roster.find((p) => p.id === state.selectedPlayerId) || starters[0] || roster[0];

    const hub = $('#squadsHub');
    if (hub) {
      hub.style.setProperty('--club-primary', club.primaryColor || '#22e07a');
      hub.style.setProperty('--club-secondary', club.secondaryColor || '#ffffff');
    }

    const select = $('#squadClubSelect');
    if (select) {
      select.innerHTML = squads
        .map((c, idx) => `<option value="${idx}" ${idx === state.currentIndex ? 'selected' : ''}>${escapeHtml(c.name)} (${escapeHtml(c.manager)})</option>`)
        .join('');
    }
    const idxLabel = $('#squadClubIndexLabel');
    if (idxLabel) idxLabel.textContent = `Clube ${state.currentIndex + 1} de ${squads.length}`;

    const carousel = $('#squadCrestCarousel');
    if (carousel) {
      carousel.innerHTML = squads
        .map((c, idx) => {
          const active = idx === state.currentIndex;
          const crestShellHtml =
            typeof window.GBLBadges !== 'undefined'
              ? window.GBLBadges.renderCrestShell(c, { shellClass: 'carousel-crest-badge' })
              : `<span class="carousel-crest-badge gbl-aspect-crest">${escapeHtml(getInitials(c.name))}</span>`;
          return `
            <button type="button" class="carousel-crest-btn ${active ? 'active' : ''}" data-select-club="${idx}" title="${escapeHtml(c.name)}" style="--cc: ${escapeHtml(c.primaryColor || '#4fd8ff')}">
              ${crestShellHtml}
              <span class="carousel-crest-name">${escapeHtml(c.name)}</span>
            </button>`;
        })
        .join('');
    }

    /* ========================================================================
     * COLUNA 1 (ESQUERDA): BANNER EXPANDIDO DO CLUBE + UNIFORMES 3D + LISTA PES
     * ======================================================================== */
    const initials = getInitials(club.name);
    const badgeInfo =
      typeof window.GBLBadges !== 'undefined'
        ? window.GBLBadges.getClubBadgeData(club)
        : { badge_url: club.badge_url || 'assets/default-shield.svg', hasCustom: Boolean(club.badge_url) };
    const calculatedAvgOvr = roster.length
      ? Math.round(roster.reduce((sum, p) => sum + (Number(p.ovr) || 80), 0) / roster.length)
      : 80;
    const avgOvr =
      Number(club.customOvr || club.avgOvr) > 0
        ? Math.round(Number(club.customOvr || club.avgOvr))
        : calculatedAvgOvr;
    const starsNum = Number(club.stars) || 4;
    const starsFormatted = starsNum.toFixed(1).replace('.0', '');
    const { availTrades, maxTrades } = getClubTradeAndReserveMetrics(club.name);

    if ($('#fifaStripClubName')) $('#fifaStripClubName').textContent = club.name;
    if ($('#fifaCountryLabel')) $('#fifaCountryLabel').textContent = club.countryLabel || 'BRASIL · LIGA OFICIAL';
    if ($('#fifaClubTag')) $('#fifaClubTag').textContent = club.clubTag || 'CLUBE OFICIAL PES 21';
    if ($('#fifaLeagueSub')) $('#fifaLeagueSub').textContent = (club.leagueName || "XUPÉ GENTE BOA'S LEAGUE").toUpperCase();
    if ($('#fifaSeasonTitle')) $('#fifaSeasonTitle').textContent = club.seasonTitle || 'Temporada PES 21';
    const crestCircle = $('#fifaCrestCircle');
    if (crestCircle) {
      if (badgeInfo.hasCustom) {
        crestCircle.style.background = 'transparent';
        crestCircle.style.borderColor = 'transparent';
        crestCircle.style.boxShadow = 'none';
        crestCircle.style.outline = 'none';
        crestCircle.classList.add('has-custom-badge', 'is-custom-crest');
        crestCircle.classList.remove('is-default-crest', 'is-placeholder-shield');
      } else {
        crestCircle.style.background = `radial-gradient(circle at 30% 25%, ${club.primaryColor || '#e11d48'}, #071642 88%)`;
        crestCircle.style.borderColor = club.secondaryColor || '#f5c84c';
        crestCircle.style.boxShadow = '';
        crestCircle.style.outline = '';
        crestCircle.classList.remove('has-custom-badge', 'is-custom-crest');
        crestCircle.classList.add('is-default-crest', 'is-placeholder-shield');
      }
    }
    const crestImgEl = $('#fifaCrestBadgeImg');
    if (crestImgEl) {
      if (badgeInfo.hasCustom) {
        crestImgEl.src = badgeInfo.badge_url;
        crestImgEl.alt = `Escudo ${club.name}`;
        crestImgEl.classList.add('has-custom-badge');
        crestImgEl.classList.remove('is-placeholder-shield');
        crestImgEl.onerror = function () {
          if (window.GBLBadges) window.GBLBadges.onImgError(this, club.name);
        };
      } else {
        crestImgEl.src = 'assets/default-shield.svg';
        crestImgEl.alt = `Emblema padrão ${club.name}`;
        crestImgEl.classList.remove('has-custom-badge');
        crestImgEl.classList.add('is-placeholder-shield');
        crestImgEl.onerror = null;
      }
    }
    if ($('#fifaCrestInitials')) {
      $('#fifaCrestInitials').textContent = initials;
      $('#fifaCrestInitials').hidden = true;
    }
    if ($('#fifaStripStars')) $('#fifaStripStars').innerHTML = renderStars(starsNum);
    if ($('#fifaStripOvrBadge')) $('#fifaStripOvrBadge').textContent = `OVR MÉDIO ${avgOvr} · ${starsFormatted}★`;
    if ($('#fifaStripManager')) $('#fifaStripManager').textContent = `Treinador: ${club.manager || '—'}`;

    // Linha de resumo de comando: "Capitão: [Nome] ([OVR]) • [Esquema e Estilo]"
    const captainRaw = (club.captain || '').trim();
    let captainDisplay = captainRaw || '—';
    if (captainRaw && !captainRaw.includes('(')) {
      const matchP = roster.find((p) => p.name.toLowerCase() === captainRaw.toLowerCase());
      if (matchP && matchP.ovr) {
        captainDisplay = `${matchP.name} (${matchP.ovr})`;
      }
    }
    const formationDisplay = (club.formation || 'Esquema Equilibrado').trim();
    if ($('#fifaStripCaptain')) {
      $('#fifaStripCaptain').textContent = `Capitão: ${captainDisplay} • ${formationDisplay}`;
    }
    if ($('#fifaFormationPill')) {
      $('#fifaFormationPill').textContent = formationDisplay;
    }

    const formBadges = (club.recentForm || ['W', 'D', 'W', 'L', 'W'])
      .map((r) => {
        const up = String(r).trim().toUpperCase();
        const cls = up === 'W' ? 'form-w' : up === 'D' ? 'form-d' : 'form-l';
        return `<span class="form-pill ${cls}">${escapeHtml(up)}</span>`;
      })
      .join('');

    const starterSet = new Set(starters.map((s) => s.id));
    const orderedRosterList = [...starters, ...subs];

    const pesPlayersRows = orderedRosterList
      .map((p) => {
        const isSel = selectedPlayer && p.id === selectedPlayer.id;
        const isStarter = starterSet.has(p.id);
        const loanNote = p.loan || getActiveLoanBadgeFromTransfers(club.name, p.name);
        return `
          <div
            class="fifa-pes-row ${isSel ? 'selected' : ''}"
            data-pes-row-player="${escapeHtml(p.id)}"
            role="button"
            tabindex="0"
            title="Clique para inspecionar ${escapeHtml(p.name)} no radar"
          >
            <span class="pes-ovr-badge ${getOvrTierClass(p.ovr)}">${escapeHtml(p.ovr)}</span>
            <span class="pes-pos-tag ${getPosGroupClass(p.pos)}">${escapeHtml(p.pos)}</span>
            <span class="fifa-pes-player-name">${escapeHtml(p.name)}</span>
            ${loanNote ? `<span class="fifa-pes-loan-tag" title="${escapeHtml(loanNote)}">⏳ Empréstimo</span>` : ''}
            <span class="fifa-pes-role-pill ${isStarter ? 'role-xi' : 'role-sub'}">${isStarter ? 'TIT' : 'RES'}</span>
          </div>`;
      })
      .join('');

    const detailsEl = $('#fifaDetailsCol');
    if (detailsEl) {
      detailsEl.innerHTML = `
        <!-- 1. Cabeçalho & Métricas Táticas da Liga -->
        <div class="fifa-club-bio">
          <div class="fifa-bio-top-bar">
            <div class="fifa-bio-head">
              <strong>${escapeHtml(club.name.toUpperCase())}</strong>
              <span>Comandado por <strong>${escapeHtml(club.manager)}</strong></span>
            </div>
            <div class="fifa-stadium-chip">
              <svg class="fifa-stadium-icon" viewBox="0 0 64 46" width="28" height="20" aria-hidden="true">
                <rect x="3" y="3" width="58" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="3.2"/>
                <line x1="32" y1="3" x2="32" y2="43" stroke="currentColor" stroke-width="2.6"/>
                <circle cx="32" cy="23" r="7" fill="none" stroke="currentColor" stroke-width="2.6"/>
              </svg>
              <div>
                <small>ARENA OFICIAL</small>
                <strong>ARENA ${escapeHtml(club.name.toUpperCase())}</strong>
              </div>
            </div>
          </div>

          <div class="fifa-tactical-metrics-bar">
            <div class="fifa-tac-pill">
              <small>TROCAS NO MERCADO</small>
              <strong>${availTrades}/${maxTrades} disponíveis</strong>
            </div>
            <div class="fifa-tac-pill">
              <small>BANCO DE RESERVAS</small>
              <strong>${subs.length}/${MAX_SUBSTITUTES} substitutos</strong>
            </div>
            <div class="fifa-tac-pill">
              <small>FASE RECENTE</small>
              <div class="hub-form-row fifa-exp-form">${formBadges}</div>
            </div>
          </div>
        </div>

        <!-- 2. Vitrine de Uniformes com Render / Perspectiva 3D e Relevo -->
        <div class="fifa-kits-3d-section">
          <div class="fifa-kits-3d-header">
            <span class="fifa-kits-3d-title">👕 UNIFORMES OFICIAIS · RENDER 3D</span>
            <span class="fifa-kits-3d-sub">Casa &amp; Visitante (PES 21)</span>
          </div>
          <div class="fifa-kits-3d-stage">
            ${window.GBLKits.render(club, 'home')}
            ${window.GBLKits.render(club, 'away')}
          </div>
        </div>

        <!-- 3. Lista Oficial de Jogadores do PES (Overalls Coloridos & Posições) -->
        <div class="fifa-pes-roster-box">
          <div class="fifa-pes-roster-head">
            <span>📋 PLANTEL OFICIAL PES (${orderedRosterList.length}/${MAX_SQUAD_SIZE})</span>
            <small>11 Titulares + ${subs.length}/${MAX_SUBSTITUTES} Reservas</small>
          </div>
          <div class="fifa-pes-roster-scroll">
            ${pesPlayersRows}
          </div>
        </div>
      `;
    }

    /* ========================================================================
     * COLUNA 2 (DIREITA): ELENCO (SPOTLIGHT + RADAR, 11 TITULARES NO CAMPO, 5 RESERVAS)
     * ======================================================================== */
    if ($('#squadTotalCount')) {
      $('#squadTotalCount').textContent = `Elenco: ${orderedRosterList.length}/${MAX_SQUAD_SIZE} (${starters.length} Titulares + ${subs.length}/${MAX_SUBSTITUTES} Reservas)`;
    }
    if ($('#fifaFormationPill')) {
      $('#fifaFormationPill').textContent = `Esquema: ${club.formation || '4-3-3 Ofensivo'}`;
    }

    const swapHint = $('#fifaSwapHint');
    if (swapHint) {
      if (state.swapSourceId) {
        const srcPlayer = roster.find((p) => p.id === state.swapSourceId);
        swapHint.innerHTML = `<strong style="color:var(--gold)">⇄ Modo Substituição:</strong> Clique em outro atleta para trocar lugar com <strong>${escapeHtml(srcPlayer?.name || '')}</strong> (ou clique novamente para cancelar).`;
      } else {
        swapHint.textContent = 'Clique em qualquer jogador para selecionar ou realizar substituições';
      }
    }

    const selCardEl = $('#fifaSelectedPlayerCard');
    if (selCardEl && selectedPlayer) {
      const loanNote = selectedPlayer.loan || getActiveLoanBadgeFromTransfers(club.name, selectedPlayer.name);
      const isStarter = starters.some((s) => s.id === selectedPlayer.id);
      const isSwappingThis = state.swapSourceId === selectedPlayer.id;

      selCardEl.innerHTML = `
        <div class="fifa-spot-top">
          <div class="fifa-spot-pos">
            <span class="fifa-pos-dot" style="background:${getPosDotColor(selectedPlayer.pos)}"></span>
            <span class="fifa-pos-code">${escapeHtml(selectedPlayer.pos)}</span>
          </div>
          <div class="fifa-spot-avatar-wrap">
            ${renderPlayerAvatarSvg(club.primaryColor, club.secondaryColor, selectedPlayer.pos)}
          </div>
          <div class="fifa-spot-ovr">${escapeHtml(selectedPlayer.ovr)}</div>
        </div>
        <div class="fifa-spot-bar">
          <span style="width:${Math.min(100, Number(selectedPlayer.ovr) || 80)}%"></span>
        </div>
        <div class="fifa-spot-name-row">
          <strong class="fifa-spot-name">${escapeHtml(selectedPlayer.name)}</strong>
          <span class="fifa-spot-status-tag ${isStarter ? 'is-starter' : 'is-sub'}">${isStarter ? 'Titular' : 'Reserva'}</span>
        </div>
        ${loanNote ? `<div class="fifa-spot-loan">⏳ ${escapeHtml(loanNote)}</div>` : ''}
        <div class="fifa-spot-actions">
          <button type="button" class="fifa-mini-btn ${isSwappingThis ? 'active-swap' : ''}" data-start-swap="${escapeHtml(selectedPlayer.id)}" title="Trocar este jogador entre Titulares e Reservas">
            ⇄ ${isSwappingThis ? 'Cancelar Troca' : 'Substituir'}
          </button>
          ${
            admin
              ? `<button type="button" class="fifa-mini-btn" data-edit-player="${escapeHtml(selectedPlayer.id)}" title="Editar jogador">✎ Editar</button>
                 <button type="button" class="fifa-mini-btn danger" data-delete-player="${escapeHtml(selectedPlayer.id)}" title="Remover jogador do elenco">✕</button>`
              : ''
          }
        </div>
      `;
    }

    const formationSelect = $('#squadFormationSelect');
    if (formationSelect) {
      formationSelect.innerHTML = Object.keys(FORMATION_PRESETS).map((key) =>
        `<option value="${key}">${key}</option>`).join('');
      formationSelect.value = getFormationKey(club.formation);
      formationSelect.disabled = !canManageFormation(club);
      formationSelect.parentElement.hidden = !canManageFormation(club);
    }

    const pitchPlayersEl = $('#fifaPitchPlayers');
    if (pitchPlayersEl) {
      const captainRaw = norm(club.captain || '');
      const slots = FORMATION_PRESETS[getFormationKey(club.formation)];
      const tokenHtml = lineup
        .slice(0, 11)
        .map((player, idx) => {
          if (!player) return '';
          const coord = slots[idx];
          const isSelected = selectedPlayer && player.id === selectedPlayer.id;
          const isSwapSource = state.swapSourceId === player.id;
          const isGK = String(player.pos).toUpperCase() === 'GK';
          const isCaptain = captainRaw && captainRaw.includes(norm(player.name));
          const loanNote = player.loan || getActiveLoanBadgeFromTransfers(club.name, player.name);

          return `
            <div
              class="pitch-player-token ${isSelected ? 'selected' : ''} ${isSwapSource ? 'swap-source' : ''}"
              style="left: ${coord.left}; top: ${coord.top};"
              data-slot-role="${coord.role}"
              data-pitch-player="${escapeHtml(player.id)}"
              role="button"
              tabindex="0"
              title="${escapeHtml(player.name)} (${escapeHtml(player.pos)} · OVR ${escapeHtml(player.ovr)})"
            >
              <div class="pitch-token-figure">
                <div class="pitch-token-ovr-col">
                  <span class="pitch-cond-arrow">↑</span>
                  <strong class="pitch-token-ovr">${escapeHtml(player.ovr)}</strong>
                </div>
                <div class="pitch-jersey-wrap">
                  ${renderPitchJerseySvg(club.primaryColor, club.secondaryColor, isGK)}
                </div>
                ${isCaptain ? `<span class="pitch-captain-badge" title="Capitão da Equipe">C</span>` : ''}
                ${loanNote ? `<span class="pitch-loan-badge" title="${escapeHtml(loanNote)}">⏳</span>` : ''}
              </div>
              <div class="pitch-token-bar">
                <span style="width: ${Math.min(100, Number(player.ovr) || 82)}%"></span>
              </div>
              <div class="pitch-token-nameplate">
                ${isSelected ? `<span class="pitch-a-btn">A</span>` : ''}
                <span class="pitch-token-name">${escapeHtml(abbreviatePlayerName(player.name))}</span>
              </div>
              <small class="pitch-token-position">${escapeHtml(POSITION_LABELS[player.pos] || player.pos)}</small>
            </div>`;
        })
        .join('');
      // Mantém os nós por atleta: left/top podem interpolar na troca de esquema.
      const template = document.createElement('template');
      template.innerHTML = tokenHtml;
      const existing = new Map([...pitchPlayersEl.children].map((node) => [node.dataset.pitchPlayer, node]));
      for (const next of [...template.content.children]) {
        const current = existing.get(next.dataset.pitchPlayer);
        if (current) {
          current.className = next.className;
          current.style.left = next.style.left;
          current.style.top = next.style.top;
          current.dataset.slotRole = next.dataset.slotRole;
          current.title = next.title;
          current.innerHTML = next.innerHTML;
          existing.delete(next.dataset.pitchPlayer);
        } else {
          pitchPlayersEl.append(next);
        }
      }
      existing.forEach((node) => node.remove());
    }

    const subsTitleEl = $('#fifaSubsTitle');
    if (subsTitleEl) {
      subsTitleEl.textContent = `SUBSTITUTES · RESERVAS (${subs.length}/${MAX_SUBSTITUTES})`;
    }

    const subsGridEl = $('#fifaSubsGrid');
    if (subsGridEl) {
      const subSlotsHtml = [];
      for (let slotIdx = 0; slotIdx < MAX_SUBSTITUTES; slotIdx++) {
        const sub = subs[slotIdx];
        if (sub) {
          const isSelected = selectedPlayer && sub.id === selectedPlayer.id;
          const isSwapSource = state.swapSourceId === sub.id;
          const loanNote = sub.loan || getActiveLoanBadgeFromTransfers(club.name, sub.name);

          subSlotsHtml.push(`
            <div
              class="fifa-sub-card ${isSelected ? 'selected' : ''} ${isSwapSource ? 'swap-source' : ''}"
              data-sub-player="${escapeHtml(sub.id)}"
              role="button"
              tabindex="0"
              title="Clique para inspecionar ${escapeHtml(sub.name)} ou substituir"
            >
              <div class="fifa-sub-card-top">
                <button
                  type="button"
                  class="fifa-sub-swap-btn"
                  data-quick-swap-sub="${escapeHtml(sub.id)}"
                  title="Colocar ${escapeHtml(sub.name)} no lugar do titular selecionado"
                >⇄</button>
                ${
                  admin
                    ? `<div class="fifa-sub-admin-btns">
                         <button type="button" class="club-action-btn" data-edit-player="${escapeHtml(sub.id)}" title="Editar jogador">✎</button>
                         <button type="button" class="club-action-btn danger" data-delete-player="${escapeHtml(sub.id)}" title="Remover jogador">✕</button>
                       </div>`
                    : ''
                }
              </div>

              <div class="fifa-sub-visual">
                <div class="fifa-sub-pos">
                  <span class="fifa-pos-dot" style="background:${getPosDotColor(sub.pos)}"></span>
                  <span>${escapeHtml(sub.pos)}</span>
                </div>
                <div class="fifa-sub-avatar">
                  ${renderPlayerAvatarSvg(club.primaryColor, club.secondaryColor, sub.pos)}
                </div>
                <div class="fifa-sub-ovr-col">
                  ${loanNote ? `<span class="sub-loan-dot" title="${escapeHtml(loanNote)}">⏳</span>` : ''}
                  <strong class="fifa-sub-ovr">${escapeHtml(sub.ovr)}</strong>
                </div>
              </div>

              <div class="fifa-sub-energy">
                <span style="width:${Math.min(100, Number(sub.ovr) || 78)}%"></span>
              </div>
              <div class="fifa-sub-name">${escapeHtml(sub.name)}</div>
            </div>
          `);
        } else {
          subSlotsHtml.push(`
            <div class="fifa-sub-card fifa-sub-empty-slot">
              <span class="empty-slot-num">SUB ${slotIdx + 1}</span>
              <span class="empty-slot-label">Vaga Livre</span>
            </div>
          `);
        }
      }
      subsGridEl.innerHTML = subSlotsHtml.join('');
    }
  }

  /* ---------- Navegação entre os 18 Clubes ---------- */
  $('#prevSquadClub')?.addEventListener('click', () => {
    state.currentIndex--;
    state.selectedPlayerId = null;
    state.swapSourceId = null;
    renderSquadsHub();
  });

  $('#nextSquadClub')?.addEventListener('click', () => {
    state.currentIndex++;
    state.selectedPlayerId = null;
    state.swapSourceId = null;
    renderSquadsHub();
  });

  $('#squadClubSelect')?.addEventListener('change', (e) => {
    state.currentIndex = Number(e.target.value) || 0;
    state.selectedPlayerId = null;
    state.swapSourceId = null;
    renderSquadsHub();
  });

  $('#squadCrestCarousel')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-select-club]');
    if (!btn) return;
    state.currentIndex = Number(btn.dataset.selectClub) || 0;
    state.selectedPlayerId = null;
    state.swapSourceId = null;
    renderSquadsHub();
  });

  /* ---------- Alternância Mobile: Elenco vs Informações do Time ---------- */
  $('#squadsMobileToggle')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-squad-view]');
    if (!btn) return;
    const view = btn.dataset.squadView;
    const hub = $('#squadsHub');
    if (hub) hub.dataset.squadView = view;
    document.querySelectorAll('#squadsMobileToggle .toggle-btn').forEach((b) => {
      b.classList.toggle('active', b === btn);
    });
  });

  /* ---------- Interações no Painel de Elenco (Seleção, Substituição e CRUD Admin) ---------- */
  function showToast(msg, type = 'info') {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.toggle('info', type === 'info');
    t.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function handlePlayerClick(playerId) {
    if (!playerId) return;
    if (state.swapSourceId) {
      if (state.swapSourceId === playerId) {
        state.swapSourceId = null;
        renderSquadsHub();
      } else {
        swapPlayersInClub(state.swapSourceId, playerId);
      }
      return;
    }
    state.selectedPlayerId = playerId;
    renderSquadsHub();
  }

  /* Clique na lista de jogadores PES dentro da Coluna 1 */
  $('#fifaClubBoard')?.addEventListener('click', (e) => {
    const pesRow = e.target.closest('[data-pes-row-player]');
    if (pesRow) {
      handlePlayerClick(pesRow.dataset.pesRowPlayer);
    }
  });

  $('#fifaSquadPanel')?.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-player]');
    if (editBtn) {
      e.stopPropagation();
      openEditPlayerModal(editBtn.dataset.editPlayer);
      return;
    }

    const delBtn = e.target.closest('[data-delete-player]');
    if (delBtn) {
      e.stopPropagation();
      deletePlayerFromCurrentClub(delBtn.dataset.deletePlayer);
      return;
    }

    const startSwapBtn = e.target.closest('[data-start-swap]');
    if (startSwapBtn) {
      if(!RBAC.requireMember())return;
      e.stopPropagation();
      const pid = startSwapBtn.dataset.startSwap;
      state.swapSourceId = state.swapSourceId === pid ? null : pid;
      renderSquadsHub();
      return;
    }

    const quickSwapSubBtn = e.target.closest('[data-quick-swap-sub]');
    if (quickSwapSubBtn) {
      if(!RBAC.requireMember())return;
      e.stopPropagation();
      const subId = quickSwapSubBtn.dataset.quickSwapSub;
      const squads = readSquads();
      const club = squads[state.currentIndex];
      const { starters } = splitStartersAndSubs(club);
      const selectedIsStarter = starters.some((s) => s.id === state.selectedPlayerId);
      if (selectedIsStarter && state.selectedPlayerId) {
        swapPlayersInClub(state.selectedPlayerId, subId);
      } else {
        state.swapSourceId = subId;
        state.selectedPlayerId = subId;
        renderSquadsHub();
        showToast('Agora clique em um titular no campo para concluir a substituição!', 'info');
      }
      return;
    }

    const pitchToken = e.target.closest('[data-pitch-player]');
    if (pitchToken) {
      handlePlayerClick(pitchToken.dataset.pitchPlayer);
      return;
    }

    const subCard = e.target.closest('[data-sub-player]');
    if (subCard) {
      handlePlayerClick(subCard.dataset.subPlayer);
    }
  });

  /* ---------- CRUD de Jogadores do Elenco ---------- */
  function openAddPlayerModal() {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('adicionar jogadores ao elenco')) return;
    const squads = readSquads();
    const club = squads[state.currentIndex];
    if (club && Array.isArray(club.roster) && club.roster.length >= MAX_SQUAD_SIZE) {
      showToast(`Limite de elenco atingido (${MAX_SQUAD_SIZE} atletas: 11 titulares + ${MAX_SUBSTITUTES} reservas). Remova um jogador antes de adicionar outro.`, 'error');
      return;
    }
    $('#sqPlayerEditId').value = '';
    $('#squadPlayerModalTitle').textContent = 'Adicionar Jogador ao Elenco';
    $('#sqPlayerName').value = '';
    $('#sqPlayerPos').value = 'CF';
    $('#sqPlayerOvr').value = '84';
    $('#sqPlayerLoan').value = '';
    $('#squadPlayerModal').hidden = false;
    setTimeout(() => $('#sqPlayerName').focus(), 50);
  }

  function openEditPlayerModal(playerId) {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('editar jogadores do elenco')) return;
    const squads = readSquads();
    const club = squads[state.currentIndex];
    const player = club?.roster?.find((p) => p.id === playerId);
    if (!player) return;

    $('#sqPlayerEditId').value = player.id;
    $('#squadPlayerModalTitle').textContent = `Editar Jogador (${club.name})`;
    $('#sqPlayerName').value = player.name || '';
    $('#sqPlayerPos').value = player.pos || 'CF';
    $('#sqPlayerOvr').value = String(player.ovr || 80);
    $('#sqPlayerLoan').value = player.loan || '';
    $('#squadPlayerModal').hidden = false;
    setTimeout(() => $('#sqPlayerName').focus(), 50);
  }

  function closeSquadPlayerModal() {
    $('#squadPlayerModal').hidden = true;
    $('#sqPlayerEditId').value = '';
  }

  async function deletePlayerFromCurrentClub(playerId) {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('remover jogadores do elenco')) return;
    const squads = readSquads();
    const club = squads[state.currentIndex];
    const target = club?.roster?.find((p) => p.id === playerId);
    if (!target) return;
    const ok = await RBAC.confirmDelete({
      title: 'Remover Jogador do Elenco',
      message: `Deseja remover "${target.name}" (${target.pos} · OVR ${target.ovr}) do elenco do ${club.name}?`,
      confirmText: '🗑️ Remover Jogador',
    });
    if (!ok) return;

    club.roster = club.roster.filter((p) => p.id !== playerId);
    if (Array.isArray(club.starterIds)) {
      club.starterIds = club.starterIds.filter((id) => id !== playerId);
    }
    writeSquads(squads);
    if (state.selectedPlayerId === playerId) state.selectedPlayerId = null;
    renderSquadsHub();
    showToast(`${target.name} removido do elenco.`, 'info');
  }

  $('#addSquadPlayerBtn')?.addEventListener('click', openAddPlayerModal);
  $('#closeSquadPlayerModal')?.addEventListener('click', closeSquadPlayerModal);
  $('#cancelSquadPlayerBtn')?.addEventListener('click', closeSquadPlayerModal);
  $('#squadPlayerModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'squadPlayerModal') closeSquadPlayerModal();
  });

  $('#squadPlayerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = $('#sqPlayerEditId').value.trim();
    const name = $('#sqPlayerName').value.trim();
    const pos = $('#sqPlayerPos').value;
    const ovr = Math.max(40, Math.min(99, Number($('#sqPlayerOvr').value) || 80));
    const loan = $('#sqPlayerLoan').value.trim();

    if (!name) return showToast('Informe o nome do jogador.', 'error');

    const squads = readSquads();
    const club = squads[state.currentIndex];
    if (!club) return;

    if (!Array.isArray(club.roster)) club.roster = [];

    if (editId) {
      club.roster = club.roster.map((p) => (p.id === editId ? { ...p, name, pos, ovr, loan } : p));
      writeSquads(squads);
      closeSquadPlayerModal();
      renderSquadsHub();
      showToast(`Jogador "${name}" atualizado!`, 'info');
    } else {
      if (club.roster.length >= MAX_SQUAD_SIZE) {
        return showToast(`O banco de reservas já possui ${MAX_SUBSTITUTES} substitutos (limite de ${MAX_SQUAD_SIZE} jogadores atingido).`, 'error');
      }
      const newId = uid();
      club.roster.push({ id: newId, name, pos, ovr, loan });
      state.selectedPlayerId = newId;
      writeSquads(squads);
      closeSquadPlayerModal();
      renderSquadsHub();
      showToast(`"${name}" adicionado ao ${club.name}!`, 'info');
    }
  });

  /* ---------- Editar Perfil do Clube Selecionado ---------- */
  function closeSquadClubMetaModal() {
    $('#squadClubMetaModal').hidden = true;
  }

  $('#editSquadClubBtn')?.addEventListener('click', () => {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('editar o clube')) return;
    const squads = readSquads();
    const club = squads[state.currentIndex];
    if (!club) return;

    $('#sqMetaName').value = club.name || '';
    $('#sqMetaManager').value = club.manager || '';
    $('#sqMetaStars').value = String(club.stars || 4);
    $('#sqMetaFormation').value = club.formation || '4-3-3 Ofensivo';
    $('#sqMetaCaptain').value = club.captain || '';
    $('#sqMetaForm').value = (club.recentForm || ['W', 'D', 'W', 'L', 'W']).join(', ');
    $('#sqMetaPrimary').value = club.primaryColor || '#2ee59d';
    $('#sqMetaSecondary').value = club.secondaryColor || '#f5c84c';
    if ($('#sqMetaKitHome')) $('#sqMetaKitHome').value = club.kitHome || 'assets/kit-home.png';
    if ($('#sqMetaKitAway')) $('#sqMetaKitAway').value = club.kitAway || 'assets/kit-away.png';
    $('#squadClubMetaModal').hidden = false;
  });

  $('#closeSquadClubMetaModal')?.addEventListener('click', closeSquadClubMetaModal);
  $('#cancelSquadClubMetaBtn')?.addEventListener('click', closeSquadClubMetaModal);
  $('#squadClubMetaModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'squadClubMetaModal') closeSquadClubMetaModal();
  });

  $('#squadClubMetaForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const squads = readSquads();
    const club = squads[state.currentIndex];
    if (!club) return;

    const name = $('#sqMetaName').value.trim();
    const manager = $('#sqMetaManager').value.trim();
    const stars = Number($('#sqMetaStars').value) || 4;
    const formation = $('#sqMetaFormation').value.trim() || '4-3-3';
    const captain = $('#sqMetaCaptain').value.trim();
    const recentForm = $('#sqMetaForm')
      .value.split(',')
      .map((s) => s.trim().toUpperCase())
      .filter((s) => ['W', 'D', 'L'].includes(s))
      .slice(0, 5);
    const primaryColor = $('#sqMetaPrimary').value || '#2ee59d';
    const secondaryColor = $('#sqMetaSecondary').value || '#ffffff';
    const kitHome = $('#sqMetaKitHome')?.value.trim() || 'assets/kit-home.png';
    const kitAway = $('#sqMetaKitAway')?.value.trim() || 'assets/kit-away.png';

    if (!name || !manager) return showToast('Preencha o nome do clube e do treinador.', 'error');

    club.name = name;
    club.manager = manager;
    club.stars = stars;
    club.formation = formation;
    club.captain = captain;
    if (recentForm.length) club.recentForm = recentForm;
    club.primaryColor = primaryColor;
    club.secondaryColor = secondaryColor;
    club.kitHome = kitHome;
    club.kitAway = kitAway;

    writeSquads(squads);
    closeSquadClubMetaModal();
    renderSquadsHub();
    window.dispatchEvent(new CustomEvent('gbl:datachange'));
    showToast("Dados do clube e treinador atualizados com sucesso em todas as seções!", 'info');
  });

  $('#openClubBadgeModalBtn')?.addEventListener('click', () => {
    const squads = readSquads();
    const club = squads[state.currentIndex];
    if (club && typeof window.GBLBadgeModal !== 'undefined') {
      window.GBLBadgeModal.open(club.id);
    }
  });

  $('#openEditClubMetadataFromSquadsBtn')?.addEventListener('click', () => {
    const squads = readSquads();
    const club = squads[state.currentIndex];
    if (club && typeof window.GBLClubMetadataModal !== 'undefined') {
      window.GBLClubMetadataModal.open(club.id);
    }
  });

  // Atualiza métricas de trocas/empréstimos e escudos sempre que o utilizador abrir a aba Elencos
  window.addEventListener('hashchange', () => {
    if (location.hash === '#elencos') renderSquadsHub();
  });
  window.addEventListener('gbl:rolechange', renderSquadsHub);
  window.addEventListener('gbl:datachange', renderSquadsHub);
  window.addEventListener('gbl:badgechange', renderSquadsHub);
  window.addEventListener('gbl:kitschange', renderSquadsHub);

  /* ---------- Inicialização ---------- */
  renderSquadsHub();
})();
