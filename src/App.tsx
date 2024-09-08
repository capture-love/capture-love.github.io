import { useEffect, useRef, useState } from "react"
import { ReactComponent as AddMediaIcon } from './svgs/add_media.svg'
import { first } from "lodash";

type Form = {
  media: File[]
  message: string
  name: string
}

function App() {
  const [form, setForm] = useState<Form>({media: [], message: '', name: ''})
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('capture-love-name')
    if (!savedName) return

    setForm({...form, name: savedName})
  }, [])

  const handleFormChange = (key: keyof typeof form, value: string | File[]) => {
    setForm({...form, [key]: value})
    if (key === 'name') localStorage.setItem('capture-love-name', value as string)
  }

  const handleImportMedia = () => {
    const inputFiles = fileInput.current?.files;
    if (!inputFiles) return

    handleFormChange('media', Array.from(inputFiles));
  };

  const handleChooseMedia = () => {
    fileInput.current?.click()
  }

  return (
    <main>
      <h1 className="header">{import.meta.env.VITE_HEADER}</h1>
      <div className="form-wrapper">
        <input
          ref={fileInput}
          onChange={handleImportMedia}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
        />
        <input
          className="text-input"
          placeholder="Ime / Nadimak"
          value={form.name}
          onChange={(e) => handleFormChange('name', e.target.value)}
        />
        <textarea
          className="text-input"
          placeholder="Poruka za mladence..."
          value={form.message}
          onChange={(e) => handleFormChange('message', e.target.value)}
          rows={4}
        />
        <div className="file-input" onClick={handleChooseMedia}>
          <div className="placeholder">
            <AddMediaIcon className="icon" />
            <span>Odaberite slike i videe<br />koje želite podijeliti</span>
          </div>
        </div>

        <button className="submit" disabled={!(first(form.media) instanceof File)}>Pošalji</button>
      </div>
    </main>
  )
}

export default App
