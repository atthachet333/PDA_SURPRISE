import { motion } from 'framer-motion';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { SceneLabel, SceneSection } from '@/components/surprise/SceneSection';
import { SecretCats } from '@/components/surprise/SecretCats';
import { anniversary } from '@/data/anniversary';

const LIFE_SLOTS = [...anniversary.familyMemories, anniversary.finalImages[2]!];

export function Scene07Life() {
  return (
    <SceneSection id="life" label="ชีวิตของเราด้วยกัน" fullHeight={false} className="overflow-hidden py-28 sm:py-36">
      <span aria-hidden="true" className="ai-warm-wash pointer-events-none absolute inset-0" />
      <div className="relative w-full max-w-6xl">
        <div className="max-w-3xl"><SceneLabel>07 · ชีวิตของเราด้วยกัน</SceneLabel><h2 className="thai-display ai-legible mt-5 font-thai text-[clamp(2.25rem,5vw,4.25rem)] font-light text-ivory">จากเรื่องของคนสองคน<br />ค่อย ๆ กลายเป็นชีวิตที่เราสร้างด้วยกัน</h2><p className="mt-6 max-w-xl font-thai text-base leading-8 text-ivory/65">บ้านที่กลับไป คนในครอบครัว เรื่องเล็ก ๆ ระหว่างวัน และแมวสองตัวที่ทำให้คำว่าเราใหญ่ขึ้นอีกหน่อย</p></div>
        <div className="mt-14 grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:grid-cols-4 sm:gap-4">
          {LIFE_SLOTS.map((slot, index) => <motion.figure key={slot.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }} className={`ai-frame-memory relative overflow-hidden ${index === 0 ? 'col-span-2 row-span-2' : index === 3 ? 'col-span-2' : ''}`}><MemoryImage photo={slot.image} alt={slot.intent} tone={index === 0 ? 'cream' : index === 3 ? 'champagne' : 'sky'} label="LIFE & FAMILY" index={index} objectPosition={slot.objectPosition} cropMode={slot.cropMode} /><figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/90 to-transparent p-4 pt-10"><p className="font-thai text-sm text-ivory">{slot.intent}</p></figcaption></motion.figure>)}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">{anniversary.pets.map((pet) => <span key={pet.id} className="ai-glass rounded-pill px-5 py-2.5 font-thai text-sm text-ivory/80">{pet.name} · แมวของเรา</span>)}</div>

        {/*
          Two faint paw marks below the pets row. They read as part of the sky
          until someone touches one. The cats are already named in the row above,
          so nothing here is load-bearing — this is only the joke that they come
          as a pair.
        */}
        <SecretCats className="mx-auto mt-10 h-16 w-full max-w-sm" />
      </div>
    </SceneSection>
  );
}
