export default function BackgroundMesh() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute left-[-10%] top-[2%] h-96 w-96 rounded-full bg-primary-blue/10 blur-3xl" />
      <div className="absolute right-[-8%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-primary-pink/10 blur-3xl" />
      <div className="absolute left-[8%] top-[36%] h-80 w-80 rounded-full bg-primary-pink/8 blur-3xl" />
      <div className="absolute right-[6%] top-[50%] h-96 w-96 rounded-full bg-primary-blue/8 blur-3xl" />
      <div className="absolute left-[-6%] top-[70%] h-[26rem] w-[26rem] rounded-full bg-primary-blue/8 blur-3xl" />
      <div className="absolute right-[-8%] top-[90%] h-80 w-80 rounded-full bg-primary-pink/8 blur-3xl" />
    </div>
  );
}
