<script lang="ts">
  import { base } from '$app/paths';
  import { getEpidemiologicalWeek, downloadCSV } from '../utils';
  import Select from 'svelte-select';

  import headerArt from '$lib/assets/headerArt.svg';
  import ifbaLogo from '$lib/assets/logo-ifba.svg';
  import petLogo from '$lib/assets/logo-pet.svg';
  import ufrbLogo from '$lib/assets/logo-ufrb.svg';
  import secretariaLogo from '$lib/assets/logo-secretaria.svg';

  import { optionsUbs, optionsLab, optionsHospitais, unidadesRuraisMap, idsUnidadesRurais } from "$lib/config/options";


  let currentWeekNum = getEpidemiologicalWeek(new Date());

  // Form State
  let manualWeekChecked = $state(false);
  let manualWeek = $state(currentWeekNum);

  let tipoEstabelecimento = $state('');
  let tipoAtendimento = $state('');
  let tipoUnidadeNotificante = $state('');
  let situacaoNotificacao = $state('');

  // Identificação
  let unidadeUBS = $state<string | null>(null);
  let hospitalUPA = $state<string | null>(null);
  let laboratorio = $state<string | null>(null);

  // Rural / Satélite logic
  let isRural = $derived(unidadeUBS != null && idsUnidadesRurais.has(unidadeUBS));
  let matrizRural = $derived(unidadeUBS != null && isRural ? unidadesRuraisMap.get(unidadeUBS) : undefined);
  let isSatelite = $state('Não');
  // Conjunto de values das satélites selecionadas
  let satelitesSelecionadas = $state<Set<string>>(new Set());

  // Quando trocar unidade, resetar satélite
  $effect(() => {
    if (!isRural) {
      isSatelite = 'Não';
      satelitesSelecionadas = new Set();
    } else if (isSatelite === 'Não') {
      satelitesSelecionadas = new Set();
    }
  });

  function toggleSatelite(value: string, checked: boolean) {
    const next = new Set(satelitesSelecionadas);
    if (checked) next.add(value);
    else next.delete(value);
    satelitesSelecionadas = next;
  }

  // UBS exclusive
  let visitaDomiciliar = $state('');
  let numVisitas = $state<number | ''>('');
  let pessoasAbordadas = $state<number | ''>('');
  
  let profissionais = $state({
    Medico: false,
    Enfermeiro: false,
    TecnicoSaude: false,
    Dentista: false,
    ACS: false
  });

  // Laboratório
  const apoioLaboratorio = $state({
    Sarampo: false,
    Rubeola: false,
    SRC: false,
    PFA: false
  });

  // PFA (UBS e Hospital)
  let casosPFA = $state('');
  let numCasosPFA = $state<number | ''>('');
  let numCasosPFAInvestigados = $state<number | ''>('');
  let coletaFezes = $state('');

  // Boletim (UBS e Hospital)
  let bSarampo = $state<number | ''>('');
  let bRubeola = $state<number | ''>('');
  let bSRC = $state<number | ''>('');
  let bTNN = $state<number | ''>('');
  let bTA = $state<number | ''>('');

  // Responsável
  let responsavel = $state('');

  function handleSubmit(e: Event) {
    e.preventDefault();

    const semanaFinal = manualWeekChecked ? manualWeek : currentWeekNum;

    // Build the data object
    const exportData: Record<string, any> = {
      'Semana Epidemiológica': semanaFinal,
      'Tipo de Estabelecimento': tipoEstabelecimento,
      'Tipo de Atendimento': tipoAtendimento,
      'Tipo de Unidade': tipoUnidadeNotificante,
      'Situação da Notificação': situacaoNotificacao
    };

    if (tipoUnidadeNotificante === 'UBS/USF' || tipoUnidadeNotificante === 'Centro Especializado e Laboratório') {
      if (tipoUnidadeNotificante === 'UBS/USF') {
        exportData['Unidade (UBS/USF)'] = optionsUbs.find((o: { value: string; label: string }) => o.value === unidadeUBS)?.label ?? unidadeUBS;
        if (isRural) {
          exportData['É Unidade Satélite?'] = isSatelite;
          if (isSatelite === 'Sim' && satelitesSelecionadas.size > 0) {
            const labels = [...satelitesSelecionadas].map((v: string) =>
              matrizRural?.satelites.find((s: { value: string; label: string }) => s.value === v)?.label ?? v
            );
            exportData['Unidades Satélites'] = labels.join('; ');
          }
        } else {
          exportData['É Unidade Satélite?'] = 'N/A';
        }
        exportData['Visita Domiciliar'] = visitaDomiciliar;
        exportData['Total de Visitas'] = visitaDomiciliar === 'Sim' ? numVisitas : 0;
        exportData['Pessoas Abordadas'] = pessoasAbordadas;
        
        const profsSelected = Object.entries(profissionais).filter(([k,v]) => v).map(([k]) => k);
        exportData['Profissionais Visita'] = profsSelected.join(', ');
      }
    }

    if (tipoUnidadeNotificante === 'Hospital' || tipoUnidadeNotificante === 'UPA') {
      exportData['Hospital/UPA'] = optionsHospitais.find((o: { value: string; label: string }) => o.value === hospitalUPA)?.label ?? hospitalUPA;
    }

    if (tipoUnidadeNotificante === 'Centro Especializado e Laboratório') {
      exportData['Laboratório'] = optionsLab.find((o: { value: string; label: string }) => o.value === laboratorio)?.label ?? laboratorio;
      const apoios = Object.entries(apoioLaboratorio).filter(([k,v]) => v).map(([k]) => k);
      exportData['Apoio em Investigação'] = apoios.join(', ');
    }

    // PFA
    if (['UBS/USF', 'Hospital', 'UPA'].includes(tipoUnidadeNotificante)) {
      exportData['Casos PFA'] = casosPFA;
      if (casosPFA === 'Sim') {
        exportData['Nº Casos PFA'] = numCasosPFA;
        exportData['Nº Casos Investigados PFA'] = numCasosPFAInvestigados;
      }
      exportData['Coleta Oportuna de Fezes'] = coletaFezes;
      
      // Boletim
      exportData['Boletim Sarampo'] = bSarampo;
      exportData['Boletim Rubeola'] = bRubeola;
      exportData['Boletim SRC'] = bSRC;
      exportData['Boletim TNN'] = bTNN;
      exportData['Boletim Tétano Acidental'] = bTA;
    }

    exportData['Responsável'] = responsavel;

    downloadCSV(exportData, `formulario_pns_semana_${semanaFinal}.csv`);
    alert("Pronto! Planilha gerada com sucesso.");
  }
</script>

<div class="container mx-auto max-w-4xl bg-white p-6 md:p-10 rounded-xl my-10 relative overflow-hidden">
  <header class="mb-8 text-center sm:text-left flex flex-col items-center sm:items-start gap-4">
    <div class="flex flex-row justify-between items-center w-full">

      <div class="header-title-area">
        <h1 class="text-3xl md:text-4xl font-bold text-primary mb-2">
          Formulário Programa de Notificação Semanal (PNS)
        </h1>
      </div>

      <div>
        <a href="{base}/" class="flex items-center">
          <img src={headerArt} class="w-auto" alt="Header Art" />
        </a>
      </div>

    </div>

    <!-- Texto embaixo -->
    <p class="text-gray-500 font-light text-sm">

      Este formulário tem como objetivo consolidar os dados das notificações semanais das Doenças Imunopreveníveis como Paralisia Flácida Aguda (PFA), Doenças Exantemáticas, Tétano Acidental (TA) e Tétano Neonatal (TNN), provenientes do município de Santo Antonio de Jesus.
      <br><br>
      O preenchimento de todas as perguntas é obrigatório
      <br><br>
      O envio do formulário deve ser feito IMPRETERIVELMENTE até a segunda-feira seguinte ao encerramento da Semana Epidemiológica correspondente.
      <br><br>
      Após esse prazo, os dados ainda serão aceitos para composição de relatórios regulares. No entanto, não serão incluídos no consolidado estadual semanal encaminhado ao Ministério da Saúde. Nesse caso, a unidade notificadora será considerada silenciosa perante o Ministério.
    </p>
    <div class="flex flex-col sm:flex-row gap-4">
      <img src={ifbaLogo} class="w-auto" alt="Logo IFBA" />
      <img src={ufrbLogo} class="w-auto" alt="Logo UFRB" />
      <img src={petLogo} class="w-auto" alt="Logo PET" />
      <img src={secretariaLogo} class="w-auto" alt="Logo Secretaria" />
    </div>
  </header>

  <hr class="h-px my-8 bg-gray-200 border-0">


  <form onsubmit={handleSubmit} class="space-y-6">
    <div class="section-title">Comum à todos</div>
    <div class="form-group flex flex-col gap-8">
      <div>
        <label class="form-label">Semana Epidemiológica</label>
        <div class="flex items-center gap-4">
          {#if !manualWeekChecked}
            <div class="px-4 py-2  text-primary font-bold rounded-lg border border-primary/20">Semana {currentWeekNum}</div>
          {:else}
            <input type="number" bind:value={manualWeek} min="1" max="53" class="form-input flex-1" placeholder="Nº Ex: 42" required />
          {/if}
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" bind:checked={manualWeekChecked} class="w-5 h-5 accent-primary" />
            <span>Semana incorreta?</span>
          </label>
        </div>
      </div>

      <div>
        <label class="form-label">Tipo de Estabelecimento</label>
        <select bind:value={tipoEstabelecimento} class="form-input" required>
          <option value="">Selecione...</option>
          <option value="Público">Público</option>
          <option value="Privado">Privado</option>
          <option value="Outro">Outro</option>
        </select>
      </div>

      <div>
        <label class="form-label">Tipo de Atendimento</label>
        <select bind:value={tipoAtendimento} class="form-input" required>
          <option value="">Selecione...</option>
          <option value="Consulta Ambulatorial">Consulta Ambulatorial</option>
          <option value="Emergência">Emergência</option>
          <option value="Internação">Internação</option>
          <option value="Apoio Diagnóstico/Laboratório">Apoio Diagnóstico/Laboratório</option>
        </select>
      </div>

      <div>
        <label class="form-label">Situação de Notificação</label>
        <div class="radio-group">
          <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="sitNotif" bind:group={situacaoNotificacao} value="Positiva" required /> Positiva</label>
          <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="sitNotif" bind:group={situacaoNotificacao} value="Negativa" required /> Negativa</label>
        </div>
      </div>

      <div>
        <label class="form-label text-primary font-bold">Tipo de Unidade Notificante</label>
        <select bind:value={tipoUnidadeNotificante} class="form-input border-primary" required>
          <option value="">Selecione...</option>
          <option value="UBS/USF">UBS/USF</option>
          <option value="Hospital">Hospital</option>
          <option value="UPA">UPA</option>
          <option value="Centro Especializado e Laboratório">Centro Especializado e Laboratório</option>
        </select>
      </div>

      <hr class="h-px my-8 bg-gray-200 border-0">

    </div>

    <!-- SECTIONS DEPENDENT ON UNITY TYPE -->
    {#if tipoUnidadeNotificante === 'UBS/USF'}
      <div class="section-title">Identificação Unidade Básica de Saúde e Unidade de Saúde da Família</div>
      <div class="form-group grid md:grid-cols-2 gap-6">
        <div>
          <label class="form-label">Identificação da UBS</label>
          <Select
                  items={optionsUbs}
                  bind:justValue={unidadeUBS}
                  placeholder="Digite ou selecione..."
          />
        </div>

        {#if isRural}
          <div class="bg-blue-50 p-4 rounded-lg col-span-1 md:col-span-2">
            <p class="form-label text-blue-800 font-semibold mb-2">Esta unidade possui satélites notificando nesta semana?</p>
            <div class="radio-group mb-3">
              <label class="flex items-center gap-2">
                <input type="radio" name="satelite" bind:group={isSatelite} value="Sim" required />
                Sim
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" name="satelite" bind:group={isSatelite} value="Não" required />
                Não
              </label>
            </div>

            {#if isSatelite === 'Sim' && matrizRural}
              <div class="mt-3 border-t border-blue-200 pt-3">
                <p class="text-sm font-medium text-blue-700 mb-2">Selecione as unidades satélites que estão notificando:</p>
                <div class="grid grid-cols-1 gap-2">
                  {#each matrizRural.satelites as sat}
                    <label class="flex items-center gap-3 cursor-pointer hover:bg-blue-100 px-3 py-2 rounded-md transition-colors">
                      <input
                        type="checkbox"
                        class="w-5 h-5 accent-blue-600"
                        checked={satelitesSelecionadas.has(sat.value)}
                        onchange={(e) => toggleSatelite(sat.value, (e.target as HTMLInputElement).checked)}
                      />
                      <span class="text-sm text-blue-900">{sat.label}</span>
                      <span class="text-xs text-blue-500 ml-auto font-mono">{sat.value}</span>
                    </label>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <div>
          <label class="form-label">Realizou visita domiciliar?</label>
          <div class="radio-group">
            <label class="flex items-center gap-2"><input type="radio" name="vd" bind:group={visitaDomiciliar} value="Sim" required /> Sim</label>
            <label class="flex items-center gap-2"><input type="radio" name="vd" bind:group={visitaDomiciliar} value="Não" required /> Não</label>
          </div>
        </div>

        {#if visitaDomiciliar === 'Sim'}
          <div>
            <label class="form-label">Nº total de visitas</label>
            <input type="number" bind:value={numVisitas} class="form-input" required min="1" />
          </div>
        {/if}

        <div>
           <label class="form-label">Nº de pessoas abordadas/atendidas</label>
           <input type="number" bind:value={pessoasAbordadas} class="form-input" required min="0" />
        </div>
      </div>
      <div class="form-group">
         <label class="form-label">Profissionais que realizaram atendimento</label>
         <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
           <label class="flex items-center gap-2"><input type="checkbox" bind:checked={profissionais.Medico} class="w-5 h-5" /> Médico</label>
           <label class="flex items-center gap-2"><input type="checkbox" bind:checked={profissionais.Enfermeiro} class="w-5 h-5" /> Enfermeiro</label>
           <label class="flex items-center gap-2"><input type="checkbox" bind:checked={profissionais.TecnicoSaude} class="w-5 h-5" /> Téc. Saúde</label>
           <label class="flex items-center gap-2"><input type="checkbox" bind:checked={profissionais.Dentista} class="w-5 h-5" /> Dentista</label>
           <label class="flex items-center gap-2"><input type="checkbox" bind:checked={profissionais.ACS} class="w-5 h-5" /> ACS</label>
         </div>
      </div>
      <hr class="h-px my-8 bg-gray-200 border-0">
    {/if}

    {#if tipoUnidadeNotificante === 'Hospital' || tipoUnidadeNotificante === 'UPA'}
       <div class="section-title">Identificação Hospital e Unidade de Pronto Atendimento</div>
       <div class="form-group grid md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">Identificação</label>
            <Select
                    items={optionsHospitais}
                    bind:justValue={hospitalUPA}
                    placeholder="Digite ou selecione..."
            />
          </div>
       </div>
      <hr class="h-px my-8 bg-gray-200 border-0">
    {/if}

    {#if tipoUnidadeNotificante === 'Centro Especializado e Laboratório'}
      <div class="section-title">Identificação Centro Especializado e Laboratório</div>
      <div class="form-group grid md:grid-cols-2 gap-6">
        <div>
          <label class="form-label">Identificação do Laboratório</label>
          <Select
                  items={optionsLab}
                  bind:justValue={laboratorio}
                  placeholder="Digite ou selecione..."
          />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Apoio na investigação e confirmação de:</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
           <label class="flex items-center gap-2"><input type="checkbox" bind:checked={apoioLaboratorio.Sarampo} class="w-5 h-5 accent-primary" /> Sarampo</label>
           <label class="flex items-center gap-2"><input type="checkbox" bind:checked={apoioLaboratorio.Rubeola} class="w-5 h-5 accent-primary" /> Rubéola</label>
           <label class="flex items-center gap-2"><input type="checkbox" bind:checked={apoioLaboratorio.SRC} class="w-5 h-5 accent-primary" /> Síndrome da Rubéola Congênita</label>
           <label class="flex items-center gap-2"><input type="checkbox" bind:checked={apoioLaboratorio.PFA} class="w-5 h-5 accent-primary" /> PFA (Processamento Amostras)</label>
        </div>
      </div>
      <hr class="h-px my-8 bg-gray-200 border-0">
    {/if}

    {#if ['UBS/USF', 'Hospital', 'UPA'].includes(tipoUnidadeNotificante)}
      <!-- PFA e Boletim -->
      <div class="section-title">Busca Ativa PFA & Doenças Imunopreveníveis</div>
      
      <div class="form-group flex flex-col gap-6">
        <div>
           <label class="form-label font-bold text-primary">Identificou casos suspeitos de PFA (Paralisia Flácida Aguda)?</label>
           <div class="radio-group">
             <label class="flex items-center gap-2"><input type="radio" name="pfa" bind:group={casosPFA} value="Sim" required /> Sim</label>
             <label class="flex items-center gap-2"><input type="radio" name="pfa" bind:group={casosPFA} value="Não" required /> Não</label>
           </div>
        </div>
        
        {#if casosPFA === 'Sim'}
           <div>
              <label class="form-label">Nº casos suspeitos</label>
              <input type="number" bind:value={numCasosPFA} class="form-input" required min="1" />
           </div>
        {/if}
        <div>
          <label class="form-label">Nº casos investigados</label>
          <input type="number" bind:value={numCasosPFAInvestigados} class="form-input" required min="0" />
        </div>

        <div class="col-span-1 md:col-span-2">
           <label class="form-label">Realizou coleta oportuna de fezes (PFA)?</label>
           <div class="radio-group">
             <label class="flex items-center gap-2"><input type="radio" name="fezes" bind:group={coletaFezes} value="Sim" required /> Sim</label>
             <label class="flex items-center gap-2"><input type="radio" name="fezes" bind:group={coletaFezes} value="Não" required /> Não</label>
           </div>
        </div>
      </div>

      <div class="mt-8">
        <h3 class="font-bold text-lg mb-4 text-primary">Quantidade de Casos Atendidos na Semana:</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
           <div>
             <label class="text-sm font-medium mb-1 block">Sarampo</label>
             <input type="number" bind:value={bSarampo} class="form-input" required min="0" placeholder="0" />
           </div>
           <div>
             <label class="text-sm font-medium mb-1 block">Rubéola</label>
             <input type="number" bind:value={bRubeola} class="form-input" required min="0" placeholder="0" />
           </div>
           <div>
             <label class="text-sm font-medium mb-1 block">Síndrome Rub. Cong.</label>
             <input type="number" bind:value={bSRC} class="form-input" required min="0" placeholder="0" />
           </div>
           <div>
             <label class="text-sm font-medium mb-1 block">Tétano Neonatal</label>
             <input type="number" bind:value={bTNN} class="form-input" required min="0" placeholder="0" />
           </div>
           <div>
             <label class="text-sm font-medium mb-1 block">Tétano Acidental</label>
             <input type="number" bind:value={bTA} class="form-input" required min="0" placeholder="0" />
           </div>
        </div>
      </div>
    {/if}

    <div class="section-title">Finalização</div>
    <div class="form-group mb-0">
      <label class="form-label">Responsável pelo preenchimento</label>
      <input type="text" bind:value={responsavel} class="form-input" required placeholder="Digite o seu nome completo" />
    </div>

    <button type="submit" class="btn-submit">
      Finalizar e Exportar CSV
    </button>
  </form>
</div>
