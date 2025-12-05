"use client";

import { useState } from "react";
import CreateMonitorModal from "./monitor-modal";
import { Plus } from "lucide-react";

export default function NewMonitorButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button  onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Add Monitor</span>
            </button>

            <CreateMonitorModal isOpen={open} onClose={() => setOpen(false)} />
        </>
    );
}
