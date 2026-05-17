import { Camera, Upload } from 'lucide-react'

export function ReportUploadBox() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
        <Camera className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-950">포트홀 사진 업로드</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        실제 업로드는 연결하지 않은 데모 영역입니다. 사진이 등록되면 AI 판별 화면에서 검증 결과를 확인합니다.
      </p>
      <button className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white" type="button">
        <Upload className="h-4 w-4" />
        사진 선택
      </button>
    </div>
  )
}
