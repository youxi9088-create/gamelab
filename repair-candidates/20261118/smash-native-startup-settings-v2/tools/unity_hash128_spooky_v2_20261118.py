"""Unity-compatible Hash128 over bytes, using Bob Jenkins' public-domain Spooky V2.

Algorithm: https://burtleburtle.net/bob/c/SpookyV2.h and SpookyV2.cpp.
Unity documents Spooky V2 and little-endian Hash128 string representation.
This computes content hashes; it never alters or skips an engine integrity check.
"""
import struct
MASK=(1<<64)-1
CONST=0xdeadbeefdeadbeef
def rot(x,n):return ((x<<n)|(x>>(64-n)))&MASK
def short_mix(s):
 for i,n in enumerate([50,52,30,41,54,48,38,37,62,34,5,36]):
  j=(i+2)%4;s[j]=rot(s[j],n);s[j]=(s[j]+s[(j+1)%4])&MASK;s[(j+2)%4]^=s[j]
def short_end(s):
 for i,n in enumerate([15,52,26,51,28,9,47,54,32,25,63]):
  j=(i+3)%4;k=(j+3)%4;s[j]^=s[k];s[k]=rot(s[k],n);s[j]=(s[j]+s[k])&MASK
def spooky128(raw,seed1=0,seed2=0):
 if len(raw)<192:
  s=[seed1,seed2,CONST,CONST];pos=0
  while pos+32<=len(raw):
   a,b,c,d=struct.unpack_from('<4Q',raw,pos);pos+=32
   s[2]=(s[2]+a)&MASK;s[3]=(s[3]+b)&MASK;short_mix(s)
   s[0]=(s[0]+c)&MASK;s[1]=(s[1]+d)&MASK
  if pos+16<=len(raw):
   a,b=struct.unpack_from('<2Q',raw,pos);pos+=16;s[2]=(s[2]+a)&MASK;s[3]=(s[3]+b)&MASK;short_mix(s)
  tail=raw[pos:];s[3]=(s[3]+(len(raw)<<56))&MASK
  if tail:
   s[2]=(s[2]+int.from_bytes(tail[:8],'little'))&MASK
   s[3]=(s[3]+int.from_bytes(tail[8:],'little'))&MASK
  else:s[2]=(s[2]+CONST)&MASK;s[3]=(s[3]+CONST)&MASK
  short_end(s)
  return struct.pack('<2Q',s[0],s[1])
 s=[seed1,seed2,CONST]*4;pos=0
 while pos+96<=len(raw):
  data=struct.unpack_from('<12Q',raw,pos);pos+=96
  for i,n in enumerate([11,32,43,31,17,28,39,57,55,54,22,46]):
   s[i]=(s[i]+data[i])&MASK;s[(i+2)%12]^=s[(i+10)%12];s[(i+11)%12]^=s[i]
   s[i]=rot(s[i],n);s[(i+11)%12]=(s[(i+11)%12]+s[(i+1)%12])&MASK
 tail=raw[pos:];last=tail+b'\0'*(95-len(tail))+bytes([len(tail)])
 data=struct.unpack('<12Q',last)
 for i in range(12):s[i]=(s[i]+data[i])&MASK
 for _ in range(3):
  for i,n in enumerate([44,15,34,21,38,33,10,13,38,53,42,54]):
   j=(i+11)%12;k=(i+1)%12;l=(i+2)%12
   s[j]=(s[j]+s[k])&MASK;s[l]^=s[j];s[k]=rot(s[k],n)
 return struct.pack('<2Q',s[0],s[1])
def unity_hash128(raw):return spooky128(raw).hex()
def selftest():
 # Independent documented Unity vectors, not expectations derived from this code.
 assert unity_hash128(b'The quick brown fox jumps over the lazy dog')=='c79306aa46e8122b1b340724747e361d'
 assert unity_hash128(bytes([10,20,30,40,50]))=='6e8dd00dc1d495a01d9e6dbffcd174b2'
 return 2
if __name__=='__main__':print({'documented_unity_vectors_passed':selftest()})
