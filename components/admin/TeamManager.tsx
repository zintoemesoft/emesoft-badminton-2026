import React, { useState, useRef } from 'react';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

// Define types locally for now to match admin/page.tsx, but ideally should be shared
export type Member = { 
    name: string; 
    level: number;
    gender?: 'M' | 'F';
    avatar?: string; // Base64 string
};

export type Team = { 
    id: string; 
    name: string; 
    alias?: string;
    group?: string;
    members?: Member[] 
};

export default function TeamManager({ teams }: { teams: Team[] }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editAlias, setEditAlias] = useState("");
    
    // Member Management State
    const [managingMembersTeamId, setManagingMembersTeamId] = useState<string | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    
    // Member Form State
    const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
    const [newMemberName, setNewMemberName] = useState("");
    const [newMemberLevel, setNewMemberLevel] = useState(1);
    const [newMemberGender, setNewMemberGender] = useState<'M' | 'F'>('M');
    const [newMemberAvatar, setNewMemberAvatar] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);

    // --- Team Editing ---
    const startEdit = (team: Team) => {
        setEditingId(team.id);
        setEditName(team.name);
        setEditAlias(team.alias || "");
        // Close member management if open
        setManagingMembersTeamId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
        setEditAlias("");
    };

    const saveTeam = async (teamId: string) => {
        if (!teamId) return;
        setLoading(true);
        try {
            const ref = doc(db, "teams", teamId);
            await updateDoc(ref, {
                name: editName,
                alias: editAlias
            });
            setEditingId(null);
        } catch (error) {
            console.error("Failed to update team", error);
            alert("Update failed!");
        } finally {
            setLoading(false);
        }
    };

    // --- Member Management ---
    const openMemberManager = (team: Team) => {
        setManagingMembersTeamId(team.id);
        setMembers(team.members || []);
        resetMemberForm();
        setEditingId(null);
    };

    const closeMemberManager = () => {
        setManagingMembersTeamId(null);
        setMembers([]);
        resetMemberForm();
    };

    const resetMemberForm = () => {
        setEditingMemberIndex(null);
        setNewMemberName("");
        setNewMemberLevel(1);
        setNewMemberGender('M');
        setNewMemberAvatar("");
        setIsDragging(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const startEditMember = (member: Member, index: number) => {
        setEditingMemberIndex(index);
        setNewMemberName(member.name);
        setNewMemberLevel(member.level);
        setNewMemberGender(member.gender || 'M');
        setNewMemberAvatar(member.avatar || "");
        setIsDragging(false);
    };

    const processFile = (file: File) => {
        // Limit size (e.g., 500KB) to prevent huge base64 strings
        if (file.size > 500 * 1024) {
            alert("File is too large! Please choose an image under 500KB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setNewMemberAvatar(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    // Drag and Drop Handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    };

    const saveMember = async () => {
        if (!newMemberName.trim() || !managingMembersTeamId) return;
        
        const memberData: Member = {
            name: newMemberName,
            level: newMemberLevel,
            gender: newMemberGender,
            avatar: newMemberAvatar
        };

        const updatedMembers = [...members];
        if (editingMemberIndex !== null) {
            // Update existing
            updatedMembers[editingMemberIndex] = memberData;
        } else {
            // Add new
            updatedMembers.push(memberData);
        }

        setMembers(updatedMembers); // Optimistic update

        try {
            const ref = doc(db, "teams", managingMembersTeamId);
            await updateDoc(ref, { members: updatedMembers });
            resetMemberForm();
        } catch (error) {
            console.error("Failed to save member", error);
            alert("Failed to save member");
            // Revert
            setMembers(members); 
        }
    };

    const removeMember = async (index: number) => {
        if (!managingMembersTeamId) return;
        if (!confirm("Remove this member?")) return;

        const updatedMembers = members.filter((_, i) => i !== index);
        setMembers(updatedMembers); // Optimistic update

        try {
            const ref = doc(db, "teams", managingMembersTeamId);
            await updateDoc(ref, { members: updatedMembers });
            if (editingMemberIndex === index) resetMemberForm();
        } catch (error) {
            console.error("Failed to remove member", error);
            alert("Failed to remove member");
            // Revert
            setMembers(members);
        }
    };


    // Sort teams by group then id
    const sortedTeams = [...teams].sort((a, b) => {
        if ((a.group || '') < (b.group || '')) return -1;
        if ((a.group || '') > (b.group || '')) return 1;
        return a.id.localeCompare(b.id);
    });

    return (
        <div className="bg-[#111] rounded-lg border border-white/10 shadow-xl overflow-hidden flex flex-col md:flex-row">
            {/* Team List (Left Side) */}
             <div className={`flex-1 border-r border-white/10 ${managingMembersTeamId ? 'hidden md:block' : ''}`}>
                <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="font-orbitron font-bold text-lg text-cyan-400">Team Management</h3>
                    <span className="text-xs text-white/50">{teams.length} Teams</span>
                </div>
                
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-black/50 text-white/50 font-mono text-xs uppercase border-b border-white/10 sticky top-0 backdrop-blur-md">
                            <tr>
                                <th className="px-4 py-3 text-center w-12">Grp</th>
                                <th className="px-4 py-3 text-left w-20">ID</th>
                                <th className="px-4 py-3 text-left">Team Name / Alias</th>
                                <th className="px-4 py-3 text-center w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedTeams.map((team) => {
                                const isEditing = editingId === team.id;
                                const isManaging = managingMembersTeamId === team.id;
                                return (
                                    <React.Fragment key={team.id}>
                                        <tr className={`transition ${isManaging ? 'bg-cyan-900/20' : 'hover:bg-white/5'}`}>
                                            <td className="px-4 py-3 text-center font-bold text-white/30">
                                                {team.group || '-'}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-white/50">
                                                {team.id}
                                            </td>
                                            
                                            {/* Name/Alias Column */}
                                            <td className="px-4 py-3">
                                                {isEditing ? (
                                                    <div className="flex flex-col gap-2">
                                                        <input 
                                                            type="text" 
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="bg-black border border-cyan-500/50 rounded px-2 py-1 text-white text-xs w-full focus:outline-none focus:border-cyan-500"
                                                            placeholder="Team Name"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            value={editAlias}
                                                            onChange={(e) => setEditAlias(e.target.value)}
                                                            className="bg-black border border-white/10 rounded px-2 py-1 text-white/70 text-xs w-full focus:outline-none focus:border-cyan-500"
                                                            placeholder="Alias..."
                                                        />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{team.name}</div>
                                                        {team.alias && <div className="text-white/50 text-xs italic">{team.alias}</div>}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => saveTeam(team.id)}
                                                            disabled={loading}
                                                            className="bg-green-600 hover:bg-green-500 text-white p-1.5 rounded transition"
                                                            title="Save"
                                                        >
                                                            💾
                                                        </button>
                                                        <button 
                                                            onClick={cancelEdit}
                                                            disabled={loading}
                                                            className="bg-red-600/50 hover:bg-red-600 text-white p-1.5 rounded transition"
                                                            title="Cancel"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => startEdit(team)}
                                                            className="bg-white/5 hover:bg-white/10 text-white/50 hover:text-white p-1.5 rounded transition"
                                                            title="Edit Name"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            onClick={() => openMemberManager(team)}
                                                            className={`p-1.5 rounded transition ${isManaging ? 'bg-cyan-600 text-white' : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white'}`}
                                                            title="Manage Members"
                                                        >
                                                            👥
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Member Manager (Right Side - Visible when managing) */}
            {managingMembersTeamId && (
                <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-white/10 bg-black/20 animate-in slide-in-from-right-10 duration-200 flex flex-col h-[600px]">
                    <div className="p-4 border-b border-white/10 bg-cyan-900/10 flex justify-between items-center">
                        <h4 className="font-bold text-white flex items-center gap-2">
                            👥 Members: <span className="text-cyan-400">{teams.find(t => t.id === managingMembersTeamId)?.name}</span>
                        </h4>
                        <button onClick={closeMemberManager} className="text-white/50 hover:text-white">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {members.length === 0 && (
                            <div className="text-center text-white/30 py-10 italic">No members found. Add one below.</div>
                        )}
                        {members.map((member, index) => (
                            <div key={index} className={`flex items-center gap-3 bg-white/5 p-3 rounded-lg border group transition ${editingMemberIndex === index ? 'border-cyan-500 bg-cyan-900/10' : 'border-white/5'}`}>
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0 border border-white/10">
                                    {member.avatar ? (
                                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs">
                                            {member.gender === 'F' ? '👩' : '👨'}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1">
                                    <div className="font-bold text-sm text-white flex items-center gap-1">
                                        {member.name}
                                        <span className={`text-[10px] px-1 rounded ${member.gender === 'F' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {member.gender}
                                        </span>
                                    </div>
                                    <div className="text-xs text-white/40">Level: {member.level}</div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => startEditMember(member, index)}
                                        className="text-cyan-400 hover:bg-cyan-900/30 p-1.5 rounded transition"
                                        title="Edit Member"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        onClick={() => removeMember(index)}
                                        className="text-red-500 hover:bg-red-900/30 p-1.5 rounded transition"
                                        title="Remove Member"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Member Form */}
                    <div className="p-4 border-t border-white/10 bg-white/5">
                        <div className="flex justify-between items-center mb-3">
                            <div className="text-xs font-bold text-white/50 uppercase tracking-wider">
                                {editingMemberIndex !== null ? 'Edit Member' : 'Add New Member'}
                            </div>
                            {editingMemberIndex !== null && (
                                <button onClick={resetMemberForm} className="text-[10px] text-red-400 hover:text-red-300">
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <input 
                                    type="text" 
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    placeholder="Member Name"
                                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-[10px] text-white/50 block mb-1">Level</label>
                                    <input 
                                        type="number" 
                                        min="1" max="5"
                                        value={newMemberLevel}
                                        onChange={(e) => setNewMemberLevel(Number(e.target.value))}
                                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-white/50 block mb-1">Gender</label>
                                    <select 
                                        value={newMemberGender}
                                        onChange={(e) => setNewMemberGender(e.target.value as 'M' | 'F')}
                                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                                    >
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-white/50 block mb-1">Avatar (Optional)</label>
                                
                                <div 
                                    className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                                        isDragging ? 'border-cyan-500 bg-cyan-900/20' : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white/30">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                        </svg>
                                        <span className="text-xs text-white/50">
                                            {isDragging ? 'Drop image here' : 'Click or Drag image here'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {newMemberAvatar && (
                                <div className="flex items-center gap-2 bg-black/30 p-2 rounded border border-green-500/30">
                                    <img src={newMemberAvatar} alt="Preview" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                                    <span className="text-xs text-green-400">Image loaded!</span>
                                    <button onClick={() => { setNewMemberAvatar(""); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-xs text-red-400 ml-auto hover:text-red-300">Remove</button>
                                </div>
                            )}

                            <button 
                                onClick={saveMember}
                                disabled={!newMemberName.trim()}
                                className={`w-full font-bold py-2 rounded transition flex justify-center items-center gap-2 ${
                                    editingMemberIndex !== null 
                                    ? 'bg-yellow-600 hover:bg-yellow-500 text-black'
                                    : 'bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                            >
                                <span>{editingMemberIndex !== null ? '💾 Save Changes' : '➕ Add Member'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
