import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { Report } from '../types';

interface FormState {
  title: string;
  description: string;
  category: string;
  isAnonymous: boolean;
  photo: string | null;
}

const EMPTY: FormState = {
  title: '',
  description: '',
  category: '',
  isAnonymous: false,
  photo: null,
};

export function useIssueForm() {
  const { user } = useAuth();
  const { addReport } = useReports();
  const [form, setForm] = useState<FormState>(EMPTY);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets.length > 0) {
      setField('photo', result.assets[0].uri);
    }
  }

  function isValid(): boolean {
    return form.title.trim().length > 0 && form.category.length > 0;
  }

  async function submit(
    address: string,
    coordinates: { latitude: number; longitude: number },
  ): Promise<void> {
    if (!user || !isValid()) return;

    const report: Report = {
      id: Date.now().toString(),
      tenantId: 'ribeirao-preto',
      userId: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      address,
      coordinates: { lat: coordinates.latitude, lon: coordinates.longitude },
      status: 'Pendente',
      isAnonymous: form.isAnonymous,
      photos: form.photo ? [form.photo] : [],
      createdAt: new Date().toISOString(),
      updates: [],
    };

    await addReport(report);
    setForm(EMPTY);
  }

  function reset() {
    setForm(EMPTY);
  }

  return { form, setField, pickImage, isValid, submit, reset };
}
