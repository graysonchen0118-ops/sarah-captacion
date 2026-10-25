// Fotos reales de Unsplash, elegidas para la Costa Blanca: villas blancas, pisos con terraza al mar,
// interiores luminosos y el local de la agencia.
export const u = (id: string, w = 1200, h?: number, extra = "") =>
  `https://images.unsplash.com/${id}?w=${w}${h ? `&h=${h}` : ""}&fit=crop&q=78&auto=format${extra}`;

const IDS = {
  villas: ["photo-1606819422797-74627f4dac0b", "photo-1613977257363-707ba9348227", "photo-1600596542815-ffad4c1539a9", "photo-1613490493576-7fde63acd811", "photo-1580587771525-78b9dba3b914", "photo-1705009448632-b4c66edb0310", "photo-1512917774080-9991f1c4c750", "photo-1624980464870-40630df96eb2", "photo-1622015663084-307d19eabbbf", "photo-1416331108676-a22ccb276e35"],
  pisos: ["photo-1512915922686-57c11dde9b6b", "photo-1598579441576-353c5de45a2f", "photo-1641328824800-9bb5bcaf7146", "photo-1623687431527-bafe5602672c", "photo-1770190244752-92516c96523f", "photo-1578266848416-c291bc0b2940", "photo-1641328824917-092771d7091d"],
  salones: ["photo-1779903726785-7cf25bed78f7", "photo-1601086540476-7d9fa9dd6023", "photo-1632829882891-5047ccc421bc", "photo-1633330977020-2bdfb8530cc2", "photo-1631510390389-c1e4fb20ff31"],
  cocinas: ["photo-1628745277866-0c4468030a81", "photo-1769745241584-be9b8227e126", "photo-1502005097973-6a7082348e28", "photo-1628797285815-453c1d0d21e3", "photo-1512916194211-3f2b7f5f7de3"],
  dormitorios: ["photo-1631048501851-4aa85ffc3be8", "photo-1512918728675-ed5a9ecdebfd", "photo-1779870458288-95fd59cd2c5b", "photo-1631048501786-4e97f20eac71", "photo-1722095454514-661600984095"],
  banos: ["photo-1709753173665-1c45072f277b", "photo-1645394776147-c6f8013814ab", "photo-1620626011761-996317b8d101", "photo-1781344334947-60c704bafd51"],
  piscinas: ["photo-1601560896164-834d6f61ea66", "photo-1571666402424-c17d7e0cf0dd", "photo-1765999906700-2d4dfd392966", "photo-1602774895672-b553538bceb9"],
  terrazas: ["photo-1769869173719-997e7be14a56", "photo-1686953377385-c26161ce0971", "photo-1716460484592-d4ad9427229a", "photo-1705095605806-4b2936e90471"],
  planos: ["photo-1786550860329-f813516e9705", "photo-1560520653-9e0e4c89eb11"],
  locales: ["photo-1746021535490-cd4d7fe7ab2a", "photo-1656646424842-3a002778be0c"],
  retratos: ["photo-1745434159123-5b99b94206ca", "photo-1500648767791-00dcc994a43e", "photo-1758518729459-235dcaadc611", "photo-1705645930353-0e335311ef20", "photo-1494790108377-be9c29b29330", "photo-1633367583895-08545d733dfe", "photo-1607990283143-e81e7a2c9349", "photo-1527980965255-d3b416303d12"],
  pueblos: ["photo-1686953377344-61f0c90aff8a", "photo-1693155118933-b1ffed4ba5c7", "photo-1591342699120-d2ea2fe7218d"],
  llaves: ["photo-1560518883-ce09059eeffa", "photo-1643804926339-e94f0a655185"],
};

export const FOTOS = IDS;
export const RETRATOS = IDS.retratos.map((id) => u(id, 160, 160, "&crop=faces"));
export const FOTO_LOCAL = IDS.locales[0] ? u(IDS.locales[0], 900, 600) : "";
