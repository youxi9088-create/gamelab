import zipfile,sys,json,hashlib
with zipfile.ZipFile(sys.argv[0])as z:
 for n,h in json.loads(z.read('MANIFEST.json')).items():assert hashlib.sha256(z.read(n)).hexdigest()==h,n
print('Archive bytes verified; no game or task executed')
