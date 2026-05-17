import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  return (
    <AuthLayout title="포트홀 위험을 미리 보고 빠르게 신고하세요">
      <Card title="로그인" description="데모용 화면이며 실제 로그인은 동작하지 않습니다." className="p-6">
        <form className="space-y-4">
          <Input label="이메일" name="email" type="email" placeholder="user@example.com" />
          <Input label="비밀번호" name="password" type="password" placeholder="비밀번호 입력" />
          <Button type="button" className="w-full">로그인</Button>
        </form>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary">공공 계정</Button>
          <Button type="button" variant="secondary">민간 계정</Button>
        </div>
        <p className="mt-5 text-center text-sm text-slate-500">
          계정이 없나요? <Link to="/auth/signup" className="font-bold text-slate-950">회원가입</Link>
        </p>
      </Card>
    </AuthLayout>
  )
}
