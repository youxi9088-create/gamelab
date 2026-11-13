import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';

export const BEDROOM_SURFACES = {
  bed: { x: -330, z: 180, halfX: 150, halfZ: 200, height: 42 },
  desk: { x: 260, z: -205, halfX: 180, halfZ: 105, height: 53 },
};
export const BEDROOM_BOUNDS = { minX: -520, maxX: 520, minZ: -400, maxZ: 400, ceiling: 208 };

export function getBedroomServiceLayout(field) {
  const side = field.team === 'blue' ? 1 : -1;
  const serviceZ = field.z + 46;
  return {
    shop: { x: field.x + side * 51, z: serviceZ },
    debrief: { x: field.x - side * 51, z: serviceZ },
  };
}

function canvasTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeLandscapeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, 256);
  sky.addColorStop(0, '#83b6d0');
  sky.addColorStop(0.65, '#d9d4b4');
  sky.addColorStop(1, '#74915e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = '#e9dfc5';
  ctx.beginPath();
  ctx.arc(408, 55, 27, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9baea7';
  ctx.beginPath();
  ctx.moveTo(0, 154); ctx.lineTo(80, 82); ctx.lineTo(145, 145); ctx.lineTo(226, 66); ctx.lineTo(325, 154); ctx.lineTo(400, 97); ctx.lineTo(512, 161); ctx.lineTo(512, 256); ctx.lineTo(0, 256); ctx.fill();
  ctx.fillStyle = '#78936e';
  ctx.fillRect(0, 166, 512, 90);
  ctx.fillStyle = '#4c7050';
  for (let i = 0; i < 17; i++) {
    const x = 10 + i * 33;
    const y = 173 + Math.sin(i * 1.7) * 15;
    ctx.fillRect(x - 3, y, 6, 65);
    ctx.beginPath(); ctx.arc(x, y - 8, 18 + (i % 3) * 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(250,244,222,0.28)';
  ctx.fillRect(0, 0, 512, 256);
  return canvasTexture(canvas);
}

function makeScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 640, 400);
  bg.addColorStop(0, '#091827');
  bg.addColorStop(1, '#24445b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 640, 400);
  ctx.fillStyle = '#d8b86c';
  ctx.fillRect(0, 0, 640, 14);
  ctx.fillRect(0, 386, 640, 14);
  ctx.strokeStyle = 'rgba(218,190,127,.7)';
  ctx.lineWidth = 3;
  ctx.strokeRect(22, 26, 596, 348);
  ctx.fillStyle = '#f4ead2';
  ctx.textAlign = 'center';
  ctx.font = 'bold 58px Georgia';
  ctx.fillText('TRENCHWING', 320, 107);
  ctx.font = '21px Georgia';
  ctx.fillStyle = '#d0c19b';
  ctx.fillText('CLAIM YOUR PLACE AMONG THE ACES OF THE GREAT WAR', 320, 148);
  ctx.fillStyle = '#8297a4';
  ctx.beginPath();
  ctx.moveTo(96, 281); ctx.lineTo(247, 246); ctx.lineTo(320, 252); ctx.lineTo(496, 288); ctx.lineTo(334, 274); ctx.lineTo(305, 331); ctx.lineTo(281, 274); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ad513b';
  ctx.fillRect(295, 225, 50, 17);
  ctx.fillStyle = '#d8b86c';
  ctx.font = 'bold 24px Georgia';
  ctx.fillText('WELCOME, PILOT', 320, 356);
  return canvasTexture(canvas);
}

function makePosterTexture(title, accent, symbol) {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e7dcc0'; ctx.fillRect(0, 0, 320, 420);
  ctx.fillStyle = accent; ctx.fillRect(0, 0, 320, 82);
  ctx.strokeStyle = '#392f28'; ctx.lineWidth = 10; ctx.strokeRect(6, 6, 308, 408);
  ctx.fillStyle = '#f2e8cf'; ctx.textAlign = 'center'; ctx.font = 'bold 27px Georgia'; ctx.fillText(title, 160, 54);
  ctx.fillStyle = '#344b5b';
  ctx.beginPath(); ctx.moveTo(38, 290); ctx.lineTo(105, 238); ctx.lineTo(158, 270); ctx.lineTo(257, 215); ctx.lineTo(285, 300); ctx.lineTo(160, 344); ctx.closePath(); ctx.fill();
  ctx.fillStyle = accent;
  ctx.beginPath(); ctx.moveTo(66, 176); ctx.lineTo(155, 148); ctx.lineTo(249, 179); ctx.lineTo(166, 170); ctx.lineTo(155, 219); ctx.lineTo(144, 171); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#392f28'; ctx.font = 'bold 24px Georgia'; ctx.fillText(symbol, 160, 388);
  return canvasTexture(canvas);
}

function createToyPlane(parent, x, y, z, color = 0x54749a, scale = 1) {
  const group = new THREE.Group();
  const paint = new THREE.MeshLambertMaterial({ color });
  const wood = new THREE.MeshLambertMaterial({ color: 0x8a5a2b });
  const dark = new THREE.MeshLambertMaterial({ color: 0x282622 });
  const fuselage = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 10), paint);
  group.add(fuselage);
  for (const [yy, zz, span] of [[2.2, -1.4, 15], [-1.3, -1.0, 12]]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(span, 0.55, 3.4), paint);
    wing.position.set(0, yy, zz);
    group.add(wing);
    for (const side of [-1, 1]) {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.35, Math.abs(yy) - 0.45, 0.35), wood);
      strut.position.set(side * span * 0.28, yy * 0.48, zz);
      group.add(strut);
    }
  }
  const prop = new THREE.Mesh(new THREE.BoxGeometry(0.3, 7, 0.35), wood);
  prop.position.z = -5.1;
  group.add(prop);
  const wheels = new THREE.Mesh(new THREE.BoxGeometry(5, 0.45, 0.5), dark);
  wheels.position.set(0, -1.8, -0.4);
  group.add(wheels);
  group.position.set(x, y, z);
  group.rotation.y = Math.PI;
  group.scale.setScalar(scale);
  parent.add(group);
  return group;
}

export function createBedroomMap(world, fields, factionFlagTexture) {
  const mats = {
    floor: new THREE.MeshLambertMaterial({ color: 0x6b5848 }),
    wall: new THREE.MeshLambertMaterial({ color: 0x486174 }),
    wallSide: new THREE.MeshLambertMaterial({ color: 0x41566a }),
    trim: new THREE.MeshLambertMaterial({ color: 0xddd0b4 }),
    darkTrim: new THREE.MeshLambertMaterial({ color: 0x26343d }),
    wood: new THREE.MeshLambertMaterial({ color: 0x765239 }),
    woodLight: new THREE.MeshLambertMaterial({ color: 0x9a7148 }),
    darkWood: new THREE.MeshLambertMaterial({ color: 0x463426 }),
    metal: new THREE.MeshLambertMaterial({ color: 0x45484a }),
    carpet: new THREE.MeshLambertMaterial({ color: 0x7c3131 }),
    cream: new THREE.MeshLambertMaterial({ color: 0xd8c698 }),
    blanket: new THREE.MeshLambertMaterial({ color: 0x587b91 }),
    blanketLight: new THREE.MeshLambertMaterial({ color: 0x9ab2b5 }),
    pillow: new THREE.MeshLambertMaterial({ color: 0xe8dfc8 }),
    screen: new THREE.MeshBasicMaterial({ map: makeScreenTexture(), toneMapped: false }),
    glass: new THREE.MeshLambertMaterial({ color: 0x8bc2d0, transparent: true, opacity: 0.68, side: THREE.DoubleSide }),
  };
  const box = (parent, w, h, d, material, x, y, z, rz = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rz;
    parent.add(mesh);
    return mesh;
  };
  const plane = (parent, w, h, material, x, y, z, rotationY = 0) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotationY;
    parent.add(mesh);
    return mesh;
  };
  const sphere = (parent, radius, material, x, y, z, sx = 1, sy = 1, sz = 1) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 9), material);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    parent.add(mesh);
    return mesh;
  };
  const baseMaterials = {
    shopWall: new THREE.MeshLambertMaterial({ color: 0x927956 }),
    plaster: new THREE.MeshLambertMaterial({ color: 0xb8ad94 }),
    stone: new THREE.MeshLambertMaterial({ color: 0x655b4b }),
    roof: new THREE.MeshLambertMaterial({ color: 0x383a35, side: THREE.DoubleSide }),
    glass: new THREE.MeshLambertMaterial({ color: 0x273237 }),
    brass: new THREE.MeshLambertMaterial({ color: 0xb99a5b }),
    signWood: new THREE.MeshLambertMaterial({ color: 0x38291d }),
    runwayShoulder: new THREE.MeshLambertMaterial({ color: 0x4b4a43 }),
    runway: new THREE.MeshLambertMaterial({ color: 0x77756b }),
    runwayMarking: new THREE.MeshLambertMaterial({ color: 0xd5c9a9 }),
  };
  const makeBaseSign = (title, subtitle, accent) => {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e8d8a8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = accent;
    ctx.fillRect(12, 12, canvas.width - 24, 44);
    ctx.strokeStyle = '#3a2a18';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    ctx.fillStyle = '#fff0cf';
    ctx.textAlign = 'center';
    ctx.font = 'bold 34px Georgia';
    ctx.fillText(title, canvas.width / 2, 44);
    ctx.fillStyle = '#352a20';
    ctx.font = 'bold 23px Georgia';
    ctx.fillText(subtitle, canvas.width / 2, 99);
    return canvasTexture(canvas);
  };
  const buildBedroomBase = (field, surface) => {
    const accent = field.team === 'blue' ? '#315b86' : '#96372d';
    const serviceLayout = getBedroomServiceLayout(field);
    const sign = (parent, title, subtitle, width, y, z) => {
      box(parent, width + 0.55, 1.15, 0.24, baseMaterials.signWood, 0, y, z + 0.03);
      const face = plane(parent, width, 0.95, new THREE.MeshBasicMaterial({ map: makeBaseSign(title, subtitle, accent), side: THREE.DoubleSide }), 0, y, z - 0.11, Math.PI);
      face.renderOrder = 2;
    };
    const window = (parent, x, y, z, width, height) => {
      box(parent, width + 0.32, height + 0.32, 0.22, mats.wood, x, y, z - 0.035);
      box(parent, width, height, 0.12, baseMaterials.glass, x, y, z - 0.16);
      box(parent, 0.12, height, 0.1, mats.woodLight, x, y, z - 0.23);
      box(parent, width, 0.11, 0.1, mats.woodLight, x, y, z - 0.23);
    };

    const shopX = serviceLayout.shop.x;
    const shopZ = serviceLayout.shop.z;
    const shop = new THREE.Group();
    shop.position.set(shopX, surface.height, shopZ);
    box(shop, 9.5, 0.38, 7.8, baseMaterials.stone, 0, 0.2, 0);
    box(shop, 8.9, 3.8, 7.2, baseMaterials.shopWall, 0, 2.25, 0);
    const shopFront = -3.62;
    for (const x of [-4.25, 4.25]) box(shop, 0.24, 3.85, 0.26, mats.darkWood, x, 2.25, shopFront - 0.1);
    for (const x of [-2.7, 2.7]) window(shop, x, 2.55, shopFront - 0.05, 1.25, 1.15);
    box(shop, 1.6, 2.8, 0.18, mats.darkWood, 0, 1.58, shopFront - 0.12);
    box(shop, 1.28, 2.42, 0.06, mats.woodLight, 0, 1.58, shopFront - 0.25);
    sphere(shop, 0.1, baseMaterials.brass, 0.52, 1.57, shopFront - 0.34);
    const shopGable = new THREE.Shape();
    shopGable.moveTo(-4.45, 0);
    shopGable.lineTo(4.45, 0);
    shopGable.lineTo(0, 1.65);
    shopGable.closePath();
    const shopGableGeo = new THREE.ShapeGeometry(shopGable);
    const shopFrontGable = new THREE.Mesh(shopGableGeo, mats.woodLight);
    shopFrontGable.position.set(0, 4.12, shopFront - 0.04);
    shopFrontGable.rotation.y = Math.PI;
    shop.add(shopFrontGable);
    const shopBackGable = new THREE.Mesh(shopGableGeo, mats.woodLight);
    shopBackGable.position.set(0, 4.12, 3.64);
    shop.add(shopBackGable);
    for (const side of [-1, 1]) {
      const roof = new THREE.Mesh(new THREE.BoxGeometry(5.05, 0.28, 7.85), baseMaterials.roof);
      roof.position.set(side * 2.05, 4.8, 0);
      roof.rotation.z = side < 0 ? 0.38 : -0.38;
      shop.add(roof);
    }
    box(shop, 0.3, 0.28, 8, mats.darkWood, 0, 5.72, 0);
    sign(shop, 'SHOP', 'AIR SERVICE', 3.9, 3.55, shopFront - 0.18);
    world.add(shop);

    const officeX = serviceLayout.debrief.x;
    const officeZ = serviceLayout.debrief.z;
    const office = new THREE.Group();
    office.position.set(officeX, surface.height, officeZ);
    box(office, 12.5, 0.42, 10, baseMaterials.stone, 0, 0.22, 0);
    box(office, 11.6, 4.4, 9.1, baseMaterials.plaster, 0, 2.55, 0);
    const officeFront = -4.56;
    for (const x of [-5.45, 5.45]) box(office, 0.3, 4.35, 0.28, mats.darkWood, x, 2.45, officeFront - 0.1);
    for (const x of [-3.5, 3.5]) window(office, x, 2.55, officeFront - 0.05, 1.55, 1.55);
    box(office, 2.05, 3.12, 0.2, mats.darkWood, 0, 1.78, officeFront - 0.14);
    box(office, 1.62, 2.66, 0.06, mats.woodLight, 0, 1.78, officeFront - 0.28);
    sphere(office, 0.1, baseMaterials.brass, 0.67, 1.76, officeFront - 0.38);
    box(office, 3.4, 0.24, 1.25, baseMaterials.stone, 0, 0.38, officeFront - 0.7);
    const officeGable = new THREE.Shape();
    officeGable.moveTo(-5.8, 0);
    officeGable.lineTo(5.8, 0);
    officeGable.lineTo(0, 1.82);
    officeGable.closePath();
    const officeGableGeo = new THREE.ShapeGeometry(officeGable);
    const officeFrontGable = new THREE.Mesh(officeGableGeo, baseMaterials.plaster);
    officeFrontGable.position.set(0, 4.75, officeFront - 0.04);
    officeFrontGable.rotation.y = Math.PI;
    office.add(officeFrontGable);
    const officeBackGable = new THREE.Mesh(officeGableGeo, baseMaterials.plaster);
    officeBackGable.position.set(0, 4.75, 4.56);
    office.add(officeBackGable);
    for (const side of [-1, 1]) {
      const roof = new THREE.Mesh(new THREE.BoxGeometry(6.55, 0.32, 9.8), baseMaterials.roof);
      roof.position.set(side * 2.75, 5.72, 0);
      roof.rotation.z = side < 0 ? 0.46 : -0.46;
      office.add(roof);
    }
    box(office, 0.36, 0.32, 10, mats.darkWood, 0, 7.08, 0);
    box(office, 1.05, 2.5, 1.1, baseMaterials.stone, 3.2, 6.5, 1.65);
    box(office, 1.3, 0.2, 1.35, mats.darkWood, 3.2, 7.86, 1.65);
    sign(office, 'DEBRIEF', 'FLIGHT RECORDS', 5.15, 3.95, officeFront - 0.2);
    world.add(office);

    // Two parallel runway lanes at each main base allow aircraft to deploy side by side.
    const runways = new THREE.Group();
    runways.position.set(field.x, surface.height, field.z);
    runways.rotation.y = field.team === 'red' ? Math.PI : 0;
    for (const laneX of [-30, 30]) {
      box(runways, 28, 0.42, 150, baseMaterials.runwayShoulder, laneX, 0.22, 0);
      box(runways, 22, 0.16, 144, baseMaterials.runway, laneX, 0.5, 0);
      for (let stripe = -5; stripe <= 5; stripe++) {
        box(runways, 0.8, 0.035, 6, baseMaterials.runwayMarking, laneX, 0.6, stripe * 12);
      }
      for (const side of [-1, 1]) {
        box(runways, 0.45, 0.035, 136, baseMaterials.runwayMarking, laneX + side * 9.6, 0.6, 0);
      }
    }
    world.add(runways);
  };

  // A continuous plank floor and four high walls make this feel like a room, not another field.
  box(world, 1140, 5, 880, mats.floor, 0, -3, 0);
  const plankMat = [0x705b47, 0x765f49, 0x80664d, 0x6b5441].map(color => new THREE.MeshLambertMaterial({ color }));
  for (let i = 0; i < 38; i++) {
    const z = -425 + i * 23;
    box(world, 1128, 0.16, 0.28, plankMat[i % plankMat.length], 0, -0.35, z);
  }
  // North wall is continuous; the landscape image sits inside a stout, closed window frame.
  box(world, 1140, 260, 18, mats.wall, 0, 130, -440);
  // East and west walls.
  box(world, 18, 260, 880, mats.wallSide, -570, 130, 0);
  box(world, 18, 260, 880, mats.wallSide, 570, 130, 0);
  // South wall has a doorway at the toy railway entrance.
  box(world, 895, 260, 18, mats.wallSide, -117.5, 130, 440);
  box(world, 45, 260, 18, mats.wallSide, 547.5, 130, 440);
  box(world, 195, 38, 18, mats.wallSide, 430, 241, 440);
  for (const x of [-555, 555]) box(world, 24, 8, 884, mats.trim, x, 5, 0);
  for (const z of [-425, 425]) {
    box(world, 1140, 8, 24, mats.trim, 0, 5, z);
    box(world, 1140, 10, 24, mats.darkTrim, 0, 253, z);
  }

  // A closed, cross-paned window with a painted view beyond the glass.
  const windowX = -105;
  const windowZ = -429.7;
  const viewMaterial = new THREE.MeshBasicMaterial({ map: makeLandscapeTexture(), toneMapped: false });
  plane(world, 228, 132, viewMaterial, windowX, 161, windowZ);
  plane(world, 214, 118, mats.glass, windowX, 161, windowZ + 0.15);
  for (const x of [-1, 1]) box(world, 13, 150, 13, mats.trim, windowX + x * 119, 161, -423);
  for (const y of [-1, 1]) box(world, 250, 14, 13, mats.trim, windowX, 161 + y * 75, -423);
  box(world, 13, 118, 13, mats.trim, windowX, 161, -422.5);
  box(world, 214, 13, 20, mats.wood, windowX, 83, -421);
  // Curtain panels frame, but do not cover, the blue-grey view through the sealed pane.
  const curtain = new THREE.MeshLambertMaterial({ color: 0x35485b });
  for (const x of [-1, 1]) {
    box(world, 33, 166, 12, curtain, windowX + x * 145, 165, -416);
    for (let pleat = 0; pleat < 4; pleat++) box(world, 3, 150, 13, mats.blanketLight, windowX + x * (130 + pleat * 8), 165, -408);
  }

  // Door panel is visibly lifted from the floor so the toy rails run below it.
  const doorX = 430;
  const doorZ = 429.5;
  box(world, 208, 220, 7, mats.wood, doorX, 118, doorZ);
  box(world, 178, 188, 3, mats.woodLight, doorX, 119, doorZ - 5);
  box(world, 8, 206, 12, mats.darkWood, doorX - 111, 111, 436);
  box(world, 8, 206, 12, mats.darkWood, doorX + 111, 111, 436);
  box(world, 228, 10, 14, mats.darkWood, doorX, 224, 436);
  box(world, 15, 13, 15, new THREE.MeshLambertMaterial({ color: 0xc39a4c }), doorX + 70, 111, 423);
  box(world, 220, 5, 42, mats.woodLight, doorX, 2.5, 432);
  const gapGlow = new THREE.MeshBasicMaterial({ color: 0xa5b9bd });
  box(world, 192, 4, 2, gapGlow, doorX, 5, 425);

  // Central woven rug, stitched border and simple geometric medallions.
  box(world, 360, 0.35, 300, mats.darkWood, 10, 0.05, 15);
  box(world, 340, 0.3, 280, mats.carpet, 10, 0.28, 15);
  box(world, 310, 0.12, 250, mats.cream, 10, 0.48, 15);
  box(world, 296, 0.1, 236, mats.carpet, 10, 0.57, 15);
  for (const x of [-130, 150]) box(world, 7, 0.15, 232, mats.cream, x, 0.67, 15);
  for (const z of [-100, 130]) box(world, 292, 0.15, 7, mats.cream, 10, 0.67, z);
  const rugDiamond = new THREE.Mesh(new THREE.OctahedronGeometry(37, 0), mats.cream);
  rugDiamond.scale.set(1.45, 0.025, 1);
  rugDiamond.position.set(10, 0.75, 15);
  world.add(rugDiamond);
  for (const [x, z] of [[-62, -57], [82, -57], [-62, 87], [82, 87]]) {
    const motif = new THREE.Mesh(new THREE.OctahedronGeometry(18, 0), mats.blanketLight);
    motif.scale.y = 0.035;
    motif.position.set(x, 0.72, z);
    world.add(motif);
  }

  // Blue squadron's miniature forward base sits directly on the made bed.
  const bed = BEDROOM_SURFACES.bed;
  const bedFrame = new THREE.MeshLambertMaterial({ color: 0x684831 });
  for (const x of [bed.x - 126, bed.x + 126]) for (const z of [bed.z - 175, bed.z + 175]) {
    box(world, 18, 35, 18, bedFrame, x, 17.5, z);
  }
  box(world, 300, 24, 370, bedFrame, bed.x, 19, bed.z);
  box(world, 290, 18, 360, mats.pillow, bed.x, 28, bed.z);
  box(world, 286, 18, 354, mats.blanket, bed.x, 28, bed.z);
  box(world, 285, 4, 268, mats.blanketLight, bed.x, 38, bed.z + 43);
  box(world, 284, 2, 230, mats.blanket, bed.x, 41, bed.z + 66);
  for (const x of [bed.x - 65, bed.x + 65]) {
    box(world, 94, 15, 56, mats.pillow, x, 39, bed.z - 137, x < bed.x ? -0.04 : 0.04);
    box(world, 22, 2, 58, mats.blanketLight, x, 47.5, bed.z - 137);
  }
  box(world, 314, 78, 16, bedFrame, bed.x, 49, bed.z - 190);
  box(world, 268, 12, 10, mats.woodLight, bed.x, 89, bed.z - 180);
  for (let i = 0; i < 5; i++) box(world, 2, 60, 2, mats.woodLight, bed.x - 125 + i * 62, 46, bed.z - 194);
  // A tiny blue pennant identifies the bedhead field without dwarfing the miniature plane.
  const bluePole = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 15, 6), mats.darkWood);
  bluePole.position.set(bed.x - 126, bed.height + 7.5, bed.z + 20);
  world.add(bluePole);
  const blueFlag = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), new THREE.MeshBasicMaterial({ map: factionFlagTexture('blue'), side: THREE.DoubleSide }));
  blueFlag.position.set(bed.x - 120, bed.height + 13, bed.z + 20);
  blueFlag.userData.windPhase = 0.8;
  world.add(blueFlag);

  // Matching blue bedside table with a warm, shaded lamp and scattered books.
  const bedside = { x: -510, z: 45 };
  box(world, 86, 12, 86, mats.wood, bedside.x, 36, bedside.z);
  for (const x of [-1, 1]) for (const z of [-1, 1]) box(world, 9, 65, 9, mats.darkWood, bedside.x + x * 34, 1, bedside.z + z * 34);
  box(world, 58, 3, 48, mats.woodLight, bedside.x, 44, bedside.z);
  box(world, 35, 5, 24, new THREE.MeshLambertMaterial({ color: 0x923c32 }), bedside.x + 6, 48, bedside.z - 4);
  box(world, 29, 5, 24, new THREE.MeshLambertMaterial({ color: 0x43596b }), bedside.x + 6, 53, bedside.z - 4);
  const lampBase = new THREE.MeshLambertMaterial({ color: 0x8b7456 });
  const lampMetal = new THREE.MeshLambertMaterial({ color: 0xb69b67 });
  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 27, 10), lampMetal);
  lampStem.position.set(bedside.x - 14, 60, bedside.z + 13);
  world.add(lampStem);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(17, 20, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0xe4c77e, side: THREE.DoubleSide }));
  shade.position.set(bedside.x - 14, 78, bedside.z + 13);
  world.add(shade);
  const lampBulb = new THREE.PointLight(0xffd798, 0.65, 270, 1.8);
  lampBulb.position.set(bedside.x - 14, 76, bedside.z + 13);
  world.add(lampBulb);
  createToyPlane(world, bed.x + 91, bed.height + 48, bed.z + 96, 0x9a4934, 2.0);

  // A compact computer desk is the red squadron's second airfield.
  const desk = BEDROOM_SURFACES.desk;
  const deskTop = new THREE.MeshLambertMaterial({ color: 0x8b6341 });
  const deskEdge = new THREE.MeshLambertMaterial({ color: 0x4e3929 });
  box(world, 360, 13, 210, deskEdge, desk.x, 45.5, desk.z);
  box(world, 354, 9, 204, deskTop, desk.x, 48.5, desk.z);
  for (const x of [-153, 153]) {
    box(world, 13, 89, 15, deskEdge, desk.x + x, 6.5, desk.z - 83);
    box(world, 13, 89, 15, deskEdge, desk.x + x, 6.5, desk.z + 83);
  }
  box(world, 340, 8, 13, deskEdge, desk.x, 12, desk.z + 81);
  box(world, 340, 8, 13, deskEdge, desk.x, 12, desk.z - 81);
  // Monitor shell, stand, glowing welcome display, keyboard and mouse.
  box(world, 114, 70, 11, mats.darkTrim, desk.x, 91, desk.z - 78);
  box(world, 100, 57, 3, new THREE.MeshLambertMaterial({ color: 0x101a24 }), desk.x, 94, desk.z - 71);
  plane(world, 95, 52, mats.screen, desk.x, 94, desk.z - 69.2);
  box(world, 8, 20, 8, mats.metal, desk.x, 47, desk.z - 77);
  box(world, 45, 5, 24, mats.metal, desk.x, 55, desk.z - 77);
  box(world, 116, 7, 34, new THREE.MeshLambertMaterial({ color: 0x343a3b }), desk.x, 57, desk.z + 5);
  for (let row = 0; row < 3; row++) for (let key = 0; key < 12; key++) {
    box(world, 5, 1, 4, new THREE.MeshLambertMaterial({ color: 0xaaa28e }), desk.x - 49 + key * 9, 61, desk.z - 4 + row * 8);
  }
  box(world, 20, 4, 27, mats.metal, desk.x + 82, 57, desk.z + 10);
  const speakerMat = new THREE.MeshLambertMaterial({ color: 0x222a2e });
  for (const x of [-76, 76]) {
    box(world, 20, 49, 22, speakerMat, desk.x + x, 77, desk.z - 76);
    sphere(world, 4, mats.metal, desk.x + x, 69, desk.z - 63, 1, 1, 0.3);
    const glow = new THREE.PointLight(0x72c1db, 0.28, 125, 2);
    glow.position.set(desk.x + x, 85, desk.z - 60);
    world.add(glow);
  }
  createToyPlane(world, desk.x - 115, desk.height + 8, desk.z + 33, 0x9e362b, 1.35);
  box(world, 70, 9, 52, new THREE.MeshLambertMaterial({ color: 0x4d6980 }), desk.x + 125, desk.height + 5, desk.z + 38, -0.035);
  // Tuck a wooden chair in front of the computer; its small wheels and back make it legible from the floor.
  const chairX = desk.x;
  const chairZ = desk.z + 152;
  box(world, 93, 12, 88, new THREE.MeshLambertMaterial({ color: 0x26323a }), chairX, 31, chairZ);
  box(world, 92, 66, 13, new THREE.MeshLambertMaterial({ color: 0x354754 }), chairX, 66, chairZ + 37);
  const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 28, 8), mats.metal);
  chairStem.position.set(chairX, 15, chairZ);
  world.add(chairStem);
  for (const [x, z] of [[-34, -30], [34, -30], [-34, 30], [34, 30]]) {
    const caster = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 6), mats.metal);
    caster.position.set(chairX + x, 2, chairZ + z);
    world.add(caster);
  }

  // Storage, model toys and a collection of boyhood aviation decorations.
  const wardrobeX = 515;
  const wardrobeZ = 154;
  box(world, 115, 216, 148, mats.darkWood, wardrobeX, 108, wardrobeZ);
  box(world, 103, 199, 7, mats.wood, wardrobeX, 109, wardrobeZ - 77);
  box(world, 3, 188, 4, mats.woodLight, wardrobeX, 109, wardrobeZ - 82);
  for (const x of [-1, 1]) {
    const handle = new THREE.Mesh(new THREE.SphereGeometry(4.2, 10, 8), lampMetal);
    handle.position.set(wardrobeX + x * 20, 105, wardrobeZ - 86);
    world.add(handle);
  }
  for (const y of [54, 100, 145, 188]) box(world, 94, 2.5, 128, mats.woodLight, wardrobeX, y, wardrobeZ);
  // A waist-high bookcase on the west wall, stocked with bright book spines.
  const shelfX = -535;
  const shelfZ = -254;
  box(world, 90, 138, 158, mats.wood, shelfX, 69, shelfZ);
  for (const y of [8, 48, 91, 133]) box(world, 96, 6, 164, mats.woodLight, shelfX, y, shelfZ);
  const bookColors = [0x9a4137, 0x355b76, 0x867240, 0x4c6a4f, 0x6d4d72, 0xc0a16b];
  for (let shelf = 0; shelf < 3; shelf++) {
    let x = shelfX - 37;
    for (let i = 0; i < 8; i++) {
      const width = 7 + (i % 3) * 2;
      const book = box(world, width, 29 + (i % 4) * 4, 7, new THREE.MeshLambertMaterial({ color: bookColors[(i + shelf) % bookColors.length] }), x + width / 2, 22 + shelf * 43, shelfZ - 68);
      book.rotation.z = i % 3 === 0 ? -0.06 : 0;
      x += width + 2;
    }
  }
  // Small plush bear on the bed and a toy chest at the room's foot.
  const plush = new THREE.MeshLambertMaterial({ color: 0x9a7651 });
  sphere(world, 16, plush, bed.x - 108, 57, bed.z - 95, 1.1, 1.2, 0.9);
  sphere(world, 11, plush, bed.x - 108, 81, bed.z - 95, 1, 1, 0.9);
  for (const x of [-1, 1]) sphere(world, 5, plush, bed.x - 108 + x * 9, 91, bed.z - 95);
  for (const x of [-1, 1]) sphere(world, 2.1, new THREE.MeshBasicMaterial({ color: 0x25201c }), bed.x - 112 + x * 7, 84, bed.z - 103, 1, 1, 0.3);
  box(world, 126, 56, 84, mats.woodLight, -25, 28, 352);
  box(world, 132, 10, 90, mats.darkWood, -25, 59, 352);
  for (let i = 0; i < 6; i++) box(world, 4, 48, 84, mats.wood, -82 + i * 23, 28, 352);

  // Framed aviation posters and pennants on the walls.
  const posterA = makePosterTexture('THE FLYING ACE', '#8d4135', '1917');
  const posterB = makePosterTexture('SKY PATROL', '#385b71', 'RFC');
  box(world, 142, 176, 8, mats.darkWood, 290, 174, -428);
  plane(world, 130, 164, new THREE.MeshBasicMaterial({ map: posterA }), 290, 174, -422.8);
  box(world, 112, 142, 8, mats.darkWood, 30, 180, -428);
  plane(world, 100, 130, new THREE.MeshBasicMaterial({ map: posterB }), 30, 180, -422.8);
  const wallBanner = new THREE.Mesh(new THREE.PlaneGeometry(110, 42), new THREE.MeshBasicMaterial({ map: factionFlagTexture('red'), side: THREE.DoubleSide }));
  wallBanner.position.set(458, 199, -421);
  world.add(wallBanner);
  // A compact lamp and trophy on the desk add warmth to the computer corner.
  box(world, 34, 6, 34, mats.woodLight, desk.x + 142, desk.height + 3, desk.z - 2);
  const deskLampStem = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3, 26, 9), lampMetal);
  deskLampStem.position.set(desk.x + 142, desk.height + 18, desk.z - 2);
  world.add(deskLampStem);
  const deskShade = new THREE.Mesh(new THREE.ConeGeometry(16, 18, 10, 1, true), new THREE.MeshLambertMaterial({ color: 0xe1bd6c, side: THREE.DoubleSide }));
  deskShade.position.set(desk.x + 142, desk.height + 38, desk.z - 2);
  world.add(deskShade);
  const deskGlow = new THREE.PointLight(0xffd18a, 0.45, 200, 1.8);
  deskGlow.position.set(desk.x + 142, desk.height + 36, desk.z - 2);
  world.add(deskGlow);
  const trophy = new THREE.Mesh(new THREE.ConeGeometry(9, 19, 8), new THREE.MeshLambertMaterial({ color: 0xc39b4d }));
  trophy.position.set(desk.x - 145, desk.height + 13, desk.z - 2);
  world.add(trophy);

  // A little flight log, map pencil and plotting compass dress the pilot's desk.
  const logCanvas = document.createElement('canvas');
  logCanvas.width = 320;
  logCanvas.height = 220;
  const logCtx = logCanvas.getContext('2d');
  logCtx.fillStyle = '#e6d8b7';
  logCtx.fillRect(0, 0, 320, 220);
  logCtx.fillStyle = '#70483a';
  logCtx.fillRect(0, 0, 156, 220);
  logCtx.fillStyle = '#e6d8b7';
  logCtx.fillRect(160, 0, 160, 220);
  logCtx.strokeStyle = '#827258';
  logCtx.lineWidth = 2;
  for (let y = 38; y < 205; y += 22) {
    logCtx.beginPath(); logCtx.moveTo(14, y); logCtx.lineTo(145, y); logCtx.stroke();
    logCtx.beginPath(); logCtx.moveTo(174, y); logCtx.lineTo(306, y); logCtx.stroke();
  }
  logCtx.fillStyle = '#392e25';
  logCtx.font = 'bold 20px Georgia';
  logCtx.fillText('FLIGHT LOG', 18, 27);
  logCtx.fillText('SORTIES', 178, 27);
  logCtx.strokeStyle = '#657c70';
  logCtx.lineWidth = 4;
  logCtx.beginPath();
  logCtx.moveTo(190, 150); logCtx.lineTo(222, 112); logCtx.lineTo(250, 132); logCtx.lineTo(291, 72); logCtx.stroke();
  const logTexture = canvasTexture(logCanvas);
  const logCover = box(world, 82, 4, 58, mats.darkWood, desk.x - 63, desk.height + 3, desk.z + 35);
  logCover.rotation.y = -0.08;
  const logPages = new THREE.Mesh(new THREE.PlaneGeometry(76, 52), new THREE.MeshBasicMaterial({ map: logTexture, side: THREE.DoubleSide }));
  logPages.rotation.x = -Math.PI / 2;
  logPages.rotation.z = -0.08;
  logPages.position.set(desk.x - 63, desk.height + 5.15, desk.z + 35);
  world.add(logPages);
  const pencil = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 54, 8), new THREE.MeshLambertMaterial({ color: 0xb64d35 }));
  pencil.rotation.z = Math.PI / 2;
  pencil.position.set(desk.x - 2, desk.height + 5.5, desk.z + 63);
  world.add(pencil);
  const compass = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 3, 16), lampMetal);
  compass.position.set(desk.x + 92, desk.height + 6, desk.z + 60);
  world.add(compass);
  sphere(world, 5.4, new THREE.MeshBasicMaterial({ color: 0x476b79 }), desk.x + 92, desk.height + 8, desk.z + 60, 1, 0.35, 1);

  // A framed bedroom-front sortie chart and an old brass wall clock fill the bare walls.
  const routePoster = makePosterTexture('SORTIE ROUTE', '#6d7858', 'BEDROOM FRONT');
  box(world, 164, 132, 8, mats.darkWood, -390, 173, -428);
  plane(world, 150, 118, new THREE.MeshBasicMaterial({ map: routePoster }), -390, 173, -422.7);
  const clock = new THREE.Group();
  clock.position.set(558, 188, -72);
  clock.rotation.y = -Math.PI / 2;
  const clockMetal = new THREE.MeshLambertMaterial({ color: 0x8b7043 });
  const clockFace = new THREE.Mesh(new THREE.CircleGeometry(29, 32), new THREE.MeshLambertMaterial({ color: 0xe7ddc6 }));
  clockFace.position.z = 1;
  const clockRim = new THREE.Mesh(new THREE.TorusGeometry(30, 3.5, 8, 32), clockMetal);
  clockRim.position.z = 1.2;
  const clockHand = new THREE.Mesh(new THREE.BoxGeometry(2.2, 17, 1.8), clockMetal);
  clockHand.position.set(0, 7, 2.4);
  const clockHandShort = new THREE.Mesh(new THREE.BoxGeometry(15, 2.5, 1.8), clockMetal);
  clockHandShort.position.set(6, -1, 2.4);
  const clockPin = new THREE.Mesh(new THREE.SphereGeometry(3.4, 10, 8), clockMetal);
  clockPin.position.z = 2.6;
  clock.add(clockFace, clockRim, clockHand, clockHandShort, clockPin);
  world.add(clock);

  // A loose collection of wooden alphabet blocks and a little tin toy add floor-level life.
  const blocks = [
    { x: 190, z: 245, color: 0x9c4137, letter: 'A', rot: -0.08 },
    { x: 216, z: 257, color: 0x3f6680, letter: 'E', rot: 0.06 },
    { x: 192, z: 271, color: 0x9a7b42, letter: 'R', rot: 0.12 },
  ];
  for (const block of blocks) {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(22, 22, 22), new THREE.MeshLambertMaterial({ color: block.color }));
    cube.position.set(block.x, 11, block.z);
    cube.rotation.y = block.rot;
    world.add(cube);
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = faceCanvas.height = 128;
    const faceCtx = faceCanvas.getContext('2d');
    faceCtx.fillStyle = '#eadbb8';
    faceCtx.fillRect(0, 0, 128, 128);
    faceCtx.fillStyle = '#3b3026';
    faceCtx.textAlign = 'center';
    faceCtx.textBaseline = 'middle';
    faceCtx.font = 'bold 86px Georgia';
    faceCtx.fillText(block.letter, 64, 65);
    const letterFace = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ map: canvasTexture(faceCanvas), side: THREE.DoubleSide }));
    letterFace.position.set(block.x, 11, block.z - 11.2);
    letterFace.rotation.y = block.rot;
    world.add(letterFace);
  }
  const toyDrum = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 19, 14), new THREE.MeshLambertMaterial({ color: 0x82914f }));
  toyDrum.position.set(251, 10, 227);
  toyDrum.rotation.z = Math.PI / 2;
  world.add(toyDrum);
  for (const z of [218, 236]) {
    const drumRim = new THREE.Mesh(new THREE.TorusGeometry(12.6, 1.2, 6, 16), mats.woodLight);
    drumRim.position.set(251, 10, z);
    drumRim.rotation.x = Math.PI / 2;
    world.add(drumRim);
  }

  // The miniature railway enters at the lifted door and circles the open floor perimeter.
  const railControls = [
    [430, 0.45, 460], [430, 0.45, 400], [445, 0.45, 330], [445, 0.45, 70],
    [445, 0.45, -140], [470, 0.45, -342], [250, 0.45, -385],
    [-145, 0.45, -385], [-440, 0.45, -385], [-440, 0.45, -100],
    [-520, 0.45, -25], [-532, 0.45, 70], [-530, 0.45, 350],
    [-430, 0.45, 405], [5, 0.45, 412], [360, 0.45, 405],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const curve = new THREE.CatmullRomCurve3(railControls, true, 'catmullrom', 0.12);
  const railCurves = [[], []];
  const sleeperCount = 420;
  const sleepers = new THREE.InstancedMesh(new THREE.BoxGeometry(10.5, 0.8, 1.6), new THREE.MeshLambertMaterial({ color: 0x493a2e }), sleeperCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < sleeperCount; i++) {
    const t = i / sleeperCount;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).setY(0).normalize();
    const side = new THREE.Vector3(tangent.z, 0, -tangent.x);
    dummy.position.set(point.x, point.y - 0.25, point.z);
    dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
    dummy.updateMatrix();
    sleepers.setMatrixAt(i, dummy.matrix);
    for (const offset of [-3.2, 3.2]) railCurves[offset < 0 ? 0 : 1].push(point.clone().addScaledVector(side, offset));
  }
  sleepers.instanceMatrix.needsUpdate = true;
  world.add(sleepers);
  const railMaterial = new THREE.MeshLambertMaterial({ color: 0x77766c });
  for (const points of railCurves) {
    const railCurve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.08);
    world.add(new THREE.Mesh(new THREE.TubeGeometry(railCurve, 520, 0.42, 5, true), railMaterial));
  }
  const engineMat = new THREE.MeshLambertMaterial({ color: 0x9b4035 });
  const engineDark = new THREE.MeshLambertMaterial({ color: 0x303336 });
  const brass = new THREE.MeshLambertMaterial({ color: 0xd0a755 });
  const cars = [];
  const makeTrainCar = (engine = false, cargoColor = 0x4c694f) => {
    const car = new THREE.Group();
    const bodyMat = engine ? engineMat : new THREE.MeshLambertMaterial({ color: cargoColor });
    box(car, engine ? 4.4 : 5.2, engine ? 3.1 : 2.8, engine ? 8 : 9, bodyMat, 0, 2.2, 0);
    box(car, engine ? 4.7 : 5.4, 0.7, engine ? 8.4 : 9.4, engineDark, 0, 0.75, 0);
    if (engine) {
      const boiler = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.45, 5.4, 12), engineMat);
      boiler.rotation.x = Math.PI / 2;
      boiler.position.set(0, 2.9, -0.65);
      car.add(boiler);
      const cab = box(car, 4.5, 3.6, 3.1, engineDark, 0, 3.05, 2.5);
      box(car, 4.8, 0.5, 3.4, brass, 0, 5.05, 2.5);
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.9, 2.2, 8), engineDark);
      stack.position.set(0, 4.2, -3.1);
      car.add(stack);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.62, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd775 }));
      lamp.position.set(0, 3, -4.2);
      car.add(lamp);
      for (const z of [-2.7, 2.7]) for (const x of [-2.25, 2.25]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.55, 12), engineDark);
        wheel.position.set(x, 0.78, z);
        wheel.rotation.z = Math.PI / 2;
        car.add(wheel);
      }
      car.userData.stack = new THREE.Vector3(0, 5.4, -3.1);
    } else {
      for (const x of [-1.35, 1.35]) {
        box(car, 1.4, 1.6, 3.5, brass, x, 3.9, 0);
        box(car, 1.4, 1.6, 3.5, bodyMat, x, 5.55, 0);
      }
      for (const z of [-3.3, 3.3]) for (const x of [-2.5, 2.5]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.45, 10), engineDark);
        wheel.position.set(x, 0.72, z);
        wheel.rotation.z = Math.PI / 2;
        car.add(wheel);
      }
    }
    world.add(car);
    cars.push(car);
    return car;
  };
  const engineCar = makeTrainCar(true);
  makeTrainCar(false, 0x4c694f);
  makeTrainCar(false, 0x80613d);
  const train = { group: null, cars, curve, length: curve.getLength(), u: 0, speed: 12, engineCar };
  const setTrainPosition = (car, u) => {
    const point = curve.getPointAt(THREE.MathUtils.euclideanModulo(u, 1));
    const tangent = curve.getTangentAt(THREE.MathUtils.euclideanModulo(u, 1)).setY(0).normalize();
    car.position.copy(point);
    car.rotation.y = Math.atan2(-tangent.x, -tangent.z);
  };
  cars.forEach((car, i) => setTrainPosition(car, -i * 14 / train.length));

  // Each bedroom airfield now has a shop and debrief office, just like the outdoor fronts.
  const fieldFlags = [];
  const shopArrows = [];
  const debriefSites = [];
  for (const field of fields) {
    const surface = field.team === 'blue' ? BEDROOM_SURFACES.bed : BEDROOM_SURFACES.desk;
    const serviceLayout = getBedroomServiceLayout(field);
    if (field.rear) {
      const runway = box(world, 25, 0.5, 126, mats.darkTrim, field.x, surface.height + 0.3, field.z);
      runway.userData.rearRunway = true;
      for (let mark = -4; mark <= 4; mark++) box(world, 1.3, 0.08, 7, mats.trim, field.x, surface.height + 0.6, field.z + mark * 13);
    } else buildBedroomBase(field, surface);
    const flagX = field.team === 'blue' ? field.x + 124 : field.x - 140;
    const flagZ = field.z + 20;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 14, 6), mats.darkTrim);
    pole.position.set(flagX, surface.height + 7, flagZ);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 4), new THREE.MeshBasicMaterial({ map: factionFlagTexture(field.team), side: THREE.DoubleSide }));
    flag.position.set(flagX + 3.8, surface.height + 12, flagZ);
    flag.userData.windPhase = field.team === 'blue' ? 0.3 : 2.1;
    world.add(pole, flag);
    fieldFlags.push(flag);
    const shopX = serviceLayout.shop.x;
    const shopZ = serviceLayout.shop.z;
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(2, 4.2, 4), new THREE.MeshBasicMaterial({ color: 0xffd21a }));
    arrow.rotation.x = Math.PI;
    arrow.position.set(shopX, surface.height + 12, shopZ - 2.6);
    arrow.userData.y = arrow.position.y;
    world.add(arrow);
    shopArrows.push(arrow);
    debriefSites.push({ ...serviceLayout.debrief, name: field.name, team: field.team });
  }

  return { fieldFlags, shopArrows, debriefSites, train };
}

export function updateBedroomTrain(train, dt) {
  if (!train?.cars?.length) return;
  train.u = THREE.MathUtils.euclideanModulo(train.u + train.speed * dt / train.length, 1);
  for (let i = 0; i < train.cars.length; i++) {
    const u = THREE.MathUtils.euclideanModulo(train.u - i * 14 / train.length, 1);
    const point = train.curve.getPointAt(u);
    const tangent = train.curve.getTangentAt(u).setY(0).normalize();
    train.cars[i].position.copy(point);
    train.cars[i].rotation.y = Math.atan2(-tangent.x, -tangent.z);
  }
}
