"use client";
import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const mock = [
  { day: "Lun", bpm: 72 },
  { day: "Mar", bpm: 75 },
  { day: "Mer", bpm: 70 },
  { day: "Jeu", bpm: 78 },
  { day: "Ven", bpm: 74 },
  { day: "Sam", bpm: 76 },
  { day: "Dim", bpm: 73 },
];

export default function Dashboard() {
  const [data, setData] = useState(mock);

  useEffect(() => {
    setData(mock);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-sm text-gray-400">BPM</div>
          <div className="text-3xl font-bold">74</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-sm text-gray-400">Blutdruck</div>
          <div className="text-3xl font-bold">122/79</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-sm text-gray-400">Schlaf</div>
          <div className="text-3xl font-bold">7,2 h</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-sm text-gray-400">Kalorien</div>
          <div className="text-3xl font-bold">1 950</div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 h-64">
        <h3 className="text-sm text-gray-400 mb-2">Herzfrequenz (BPM)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bpm" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
