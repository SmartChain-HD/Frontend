import { X, Check, XCircle } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { useState } from 'react';

interface PermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (action: 'approve' | 'reject') => void;
}

export default function PermissionModal({ isOpen, onClose, onConfirm }: PermissionModalProps) {
    const [action, setAction] = useState<'approve' | 'reject'>('approve');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-[20px] p-[24px] w-[500px] flex flex-col gap-[24px] relative shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="font-title-large text-[#212529]">권한 설정</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-[24px] h-[24px] text-[#212529]" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex gap-[24px]">
                    <div 
                        className="flex items-center gap-[8px] cursor-pointer"
                        onClick={() => setAction('approve')}
                    >
                        <div className={`w-[24px] h-[24px] rounded-full border flex items-center justify-center ${
                            action === 'approve' ? 'border-[#002970]' : 'border-[#adb5bd]'
                        }`}>
                             {action === 'approve' && <div className="w-[12px] h-[12px] bg-[#002970] rounded-full" />}
                        </div>
                        <p className="font-body-small text-[#212529]">승인</p>
                    </div>

                    <div 
                        className="flex items-center gap-[8px] cursor-pointer"
                        onClick={() => setAction('reject')}
                    >
                        <div className={`w-[24px] h-[24px] rounded-full border flex items-center justify-center ${
                            action === 'reject' ? 'border-[#002970]' : 'border-[#adb5bd]'
                        }`}>
                            {action === 'reject' && <div className="w-[12px] h-[12px] bg-[#002970] rounded-full" />}
                        </div>
                        <p className="font-body-small text-[#212529]">반려</p>
                    </div>
                </div>

                {/* Footer */}
                <Button 
                    variant="primary" 
                    className="w-full h-[64px] rounded-[20px] bg-[#002554] text-[18px]"
                    onClick={() => onConfirm(action)}
                >
                    권한 설정
                </Button>
            </div>
        </div>
    );
}
