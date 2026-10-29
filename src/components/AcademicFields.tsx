export type AcademicInfo = {
  education_course: string;
  education_institution: string;
  education_period: string;
  education_shift: string;
  education_completion: string;
};

export function AcademicFields({ values }: { values?: AcademicInfo }) {
  return <div className="form-grid academic-fields">
    <label className="field-full"><span>Curso <small>Opcional</small></span><input name="education_course" maxLength={160} defaultValue={values?.education_course || ''} placeholder="Ex.: Administração" /></label>
    <label className="field-full"><span>Instituição de ensino <small>Opcional</small></span><input name="education_institution" maxLength={180} defaultValue={values?.education_institution || ''} placeholder="Nome da instituição" /></label>
    <label><span>Período ou série <small>Opcional</small></span><input name="education_period" maxLength={80} defaultValue={values?.education_period || ''} placeholder="Ex.: 4º período" /></label>
    <label><span>Turno <small>Opcional</small></span><select name="education_shift" defaultValue={values?.education_shift || ''}><option value="">Selecione</option><option>Manhã</option><option>Tarde</option><option>Noite</option><option>Integral</option><option>A distância</option><option>Outro</option></select></label>
    <label><span>Previsão de conclusão <small>Opcional</small></span><input name="education_completion" type="month" defaultValue={values?.education_completion || ''} /></label>
  </div>;
}
