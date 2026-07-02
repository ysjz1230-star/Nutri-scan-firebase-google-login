import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, X } from 'lucide-react';

interface Props {
  feature: string;
  onClose: () => void;
}

export default function LoginPromptModal({ feature, onClose }: Props) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-7 space-y-5 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-warning" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">무료 체험 횟수 소진</h2>
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-medium text-gray-700">{feature}</span> 기능을<br />
            3회 무료로 사용하셨습니다.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            로그인하면 모든 기능을 <span className="text-primary font-medium">무제한</span>으로 사용할 수 있어요!
          </p>
        </div>

        <ul className="text-left space-y-2 bg-gray-50 rounded-2xl p-4 text-sm text-gray-600">
          {[
            '📷 냉장고 AI 재료 인식 무제한',
            '🍳 AI 레시피 추천 무제한',
            '🔥 칼로리 기록 및 통계',
            '🛡️ 알레르기 맞춤 필터링',
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="space-y-2">
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-2xl font-semibold hover:bg-primary-dark transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Google로 로그인 / 가입하기
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  );
}
