import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export function SignupPage() {
  return (
    <AuthLayout title="신고와 관할 연결을 한 흐름으로 준비합니다">
      <Card title="회원가입" description="데모용 화면이며 실제 계정은 생성되지 않습니다." className="p-6">
        <form className="space-y-4">
          <Input label="이름" name="name" placeholder="홍길동" />
          <Input label="이메일" name="email" type="email" placeholder="user@example.com" />
          <Input label="비밀번호" name="password" type="password" placeholder="비밀번호 입력" />
          <label className="block text-sm font-semibold text-slate-700">
            사용자 역할
            <select className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3">
              {['배달 라이더', '일반 운전자', '피해 차주', '지자체 담당자'].map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          <Button type="button" className="w-full">회원가입</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          이미 계정이 있나요? <Link to="/auth/login" className="font-bold text-slate-950">로그인</Link>
        </p>
      </Card>
    </AuthLayout>
  )
}
