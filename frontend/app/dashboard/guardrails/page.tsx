'use client';

import { useState } from 'react';
import { Plus, Trash2, ArrowUpDown, ChevronRight, X, Check, Info, ChevronDown } from 'lucide-react';
import { guardrails, Guardrail } from '@/data/mock/guardrails';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface DeniedTopic {
  name: string;
  definition: string;
  inputEnabled: boolean;
  inputAction: string;
  outputEnabled: boolean;
  outputAction: string;
}

interface PIIType {
  type: string;
  inputEnabled: boolean;
  inputAction: string;
  outputEnabled: boolean;
  outputAction: string;
}

interface RegexPattern {
  name: string;
  pattern: string;
  inputEnabled: boolean;
  inputAction: string;
  outputEnabled: boolean;
  outputAction: string;
  description?: string;
}

interface CustomWord {
  phrase: string;
  inputEnabled: boolean;
  inputAction: string;
  outputEnabled: boolean;
  outputAction: string;
}

export default function GuardrailsPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [guardrailsList, setGuardrailsList] = useState<Guardrail[]>(guardrails);

  // Modal states
  const [showDeniedTopicModal, setShowDeniedTopicModal] = useState(false);
  const [showPIIModal, setShowPIIModal] = useState(false);
  const [showRegexModal, setShowRegexModal] = useState(false);
  const [showWordModal, setShowWordModal] = useState(false);
  const [showSamplePhrases, setShowSamplePhrases] = useState(false);
  const [showRegexDescription, setShowRegexDescription] = useState(false);

  // Form states for modals
  const [deniedTopicForm, setDeniedTopicForm] = useState<DeniedTopic>({
    name: '',
    definition: '',
    inputEnabled: true,
    inputAction: 'Block',
    outputEnabled: true,
    outputAction: 'Block',
  });

  const [piiForm, setPIIForm] = useState<PIIType>({
    type: '',
    inputEnabled: true,
    inputAction: 'Block',
    outputEnabled: true,
    outputAction: 'Block',
  });

  const [regexForm, setRegexForm] = useState<RegexPattern>({
    name: '',
    pattern: '',
    inputEnabled: true,
    inputAction: 'Block',
    outputEnabled: true,
    outputAction: 'Block',
    description: '',
  });

  const [wordForm, setWordForm] = useState<CustomWord>({
    phrase: '',
    inputEnabled: true,
    inputAction: 'Block',
    outputEnabled: true,
    outputAction: 'Block',
  });

  // Form state
  const getInitialFormData = () => ({
    name: '',
    description: '',
    blockedMessage: 'Sorry, the model cannot answer this question.',
    applyToResponse: true,
    // Content filters
    enableContentFilters: true,
    useSameFilters: true,
    hateSeverity: 3,
    insultsSeverity: 3,
    sexualSeverity: 3,
    violenceSeverity: 3,
    misconductSeverity: 3,
    promptAttackSeverity: 3,
    contentFilterTier: 'classic',
    // Denied topics
    deniedTopics: [] as DeniedTopic[],
    deniedTopicsTier: 'classic',
    // Word filters
    filterProfanity: false,
    customWords: [] as CustomWord[],
    // PII filters
    piiTypes: [] as PIIType[],
    regexPatterns: [] as RegexPattern[],
    // Grounding check
    enableGrounding: false,
    enableRelevance: false,
  });

  const [formData, setFormData] = useState(getInitialFormData());

  const sortedGuardrails = [...guardrailsList].sort((a, b) => {
    let aVal = a[sortColumn as keyof Guardrail];
    let bVal = b[sortColumn as keyof Guardrail];

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const steps = [
    { num: 1, title: 'Provide guardrail details', optional: false },
    { num: 2, title: 'Configure content filters', optional: true },
    { num: 3, title: 'Add denied topics', optional: true },
    { num: 4, title: 'Add word filters', optional: true },
    { num: 5, title: 'Add sensitive information filters', optional: true },
    { num: 6, title: 'Add contextual grounding check', optional: true },
    { num: 7, title: 'Review and create', optional: false },
  ];

  const categories = [
    { id: 'hate', label: 'Hate', value: formData.hateSeverity, onChange: (v: number) => setFormData({ ...formData, hateSeverity: v }) },
    { id: 'insults', label: 'Insults', value: formData.insultsSeverity, onChange: (v: number) => setFormData({ ...formData, insultsSeverity: v }) },
    { id: 'sexual', label: 'Sexual', value: formData.sexualSeverity, onChange: (v: number) => setFormData({ ...formData, sexualSeverity: v }) },
    { id: 'violence', label: 'Violence', value: formData.violenceSeverity, onChange: (v: number) => setFormData({ ...formData, violenceSeverity: v }) },
    { id: 'misconduct', label: 'Misconduct', value: formData.misconductSeverity, onChange: (v: number) => setFormData({ ...formData, misconductSeverity: v }) },
  ];

  const piiTypeOptions = [
    'EMAIL', 'PHONE', 'CREDIT_CARD', 'SSN', 'PASSPORT',
    'DRIVER_LICENSE', 'ADDRESS', 'NAME', 'DATE_OF_BIRTH', 'IP_ADDRESS'
  ];

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleAddDeniedTopic = () => {
    setFormData({
      ...formData,
      deniedTopics: [...formData.deniedTopics, deniedTopicForm],
    });
    setDeniedTopicForm({
      name: '',
      definition: '',
      inputEnabled: true,
      inputAction: 'Block',
      outputEnabled: true,
      outputAction: 'Block',
    });
    setShowDeniedTopicModal(false);
  };

  const handleAddPII = () => {
    setFormData({
      ...formData,
      piiTypes: [...formData.piiTypes, piiForm],
    });
    setPIIForm({
      type: '',
      inputEnabled: true,
      inputAction: 'Block',
      outputEnabled: true,
      outputAction: 'Block',
    });
    setShowPIIModal(false);
  };

  const handleAddRegex = () => {
    setFormData({
      ...formData,
      regexPatterns: [...formData.regexPatterns, regexForm],
    });
    setRegexForm({
      name: '',
      pattern: '',
      inputEnabled: true,
      inputAction: 'Block',
      outputEnabled: true,
      outputAction: 'Block',
      description: '',
    });
    setShowRegexModal(false);
  };

  const handleAddWord = () => {
    setFormData({
      ...formData,
      customWords: [...formData.customWords, wordForm],
    });
    setWordForm({
      phrase: '',
      inputEnabled: true,
      inputAction: 'Block',
      outputEnabled: true,
      outputAction: 'Block',
    });
    setShowWordModal(false);
  };

  const handleDeleteDeniedTopic = (index: number) => {
    setFormData({
      ...formData,
      deniedTopics: formData.deniedTopics.filter((_, i) => i !== index),
    });
  };

  const handleDeletePII = (index: number) => {
    setFormData({
      ...formData,
      piiTypes: formData.piiTypes.filter((_, i) => i !== index),
    });
  };

  const handleDeleteRegex = (index: number) => {
    setFormData({
      ...formData,
      regexPatterns: formData.regexPatterns.filter((_, i) => i !== index),
    });
  };

  const handleDeleteWord = (index: number) => {
    setFormData({
      ...formData,
      customWords: formData.customWords.filter((_, i) => i !== index),
    });
  };

  const handleCreateGuardrail = () => {
    const newGuardrail: Guardrail = {
      id: `gr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name || 'Untitled Guardrail',
      type: 'bedrock',
      mode: 'during' as const,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGuardrailsList([newGuardrail, ...guardrailsList]);
    setFormData(getInitialFormData());
    setCurrentStep(1);
    setShowWizard(false);
  };

  const SortButton = ({ column, label }: { column: string; label: string }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-gray-900"
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getProviderLabel = (type: string) => {
    const providers: Record<string, string> = {
      openai_moderation: 'OpenAI Moderation',
      presidio: 'Presidio PII',
      prompt_injection: 'Prompt Injection',
      bedrock: 'Bedrock Guardrail',
      custom_regex: 'Custom Regex',
    };
    return providers[type] || type;
  };

  const getSeverityLabel = (value: number) => {
    const labels = ['None', 'Low', 'Medium', 'High'];
    return labels[value] || 'None';
  };

  // Modal Component
  const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  if (showWizard) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Create guardrail</h1>
            <button
              onClick={() => {
                setShowWizard(false);
                setFormData(getInitialFormData());
                setCurrentStep(1);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar Steps */}
          <div className="w-64 bg-white border-r border-gray-200 p-6 space-y-1">
            {steps.map((step) => (
              <div
                key={step.num}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer ${
                  currentStep === step.num
                    ? 'bg-indigo-50 border-l-4 border-indigo-600 pl-2'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setCurrentStep(step.num as Step)}
              >
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                    currentStep === step.num
                      ? 'bg-indigo-600 text-white'
                      : currentStep > step.num
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.num ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.num
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Step {step.num}
                    {step.optional && (
                      <span className="text-xs text-gray-500 italic ml-1">- optional</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {step.title}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            {/* Step 1: Guardrail Details */}
            {currentStep === 1 && (
              <div className="max-w-3xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Provide guardrail details
                </h2>

                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Guardrail details
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Valid characters are a-z, A-Z, 0-9, _ (underscore) and - (hyphen). The name can have up to 50 characters.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Description - <span className="italic font-normal">optional</span>
                        </label>
                        <textarea
                          placeholder="Enter description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          The description can have up to 200 characters.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Messaging for blocked prompts
                        </label>
                        <p className="text-sm text-gray-600 mb-2">
                          Enter a message to display if your guardrail blocks the user prompt.
                        </p>
                        <textarea
                          value={formData.blockedMessage}
                          onChange={(e) => setFormData({ ...formData, blockedMessage: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          The message can have up to 500 characters.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={formData.applyToResponse}
                          onChange={(e) => setFormData({ ...formData, applyToResponse: e.target.checked })}
                          className="mt-1"
                        />
                        <label className="text-sm text-gray-900">
                          Apply the same blocked message for responses
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => {
                      setShowWizard(false);
                      setFormData(getInitialFormData());
                      setCurrentStep(1);
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Content Filters */}
            {currentStep === 2 && (
              <div className="max-w-5xl">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Configure content filters
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Step 2 - <span className="italic">optional</span>
                </p>

                <div className="space-y-6">
                  {/* Harmful Categories */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Harmful categories
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Enable detection and blocking of harmful user inputs and model responses. Use a higher filter strength to help improve the filtering of harmful content in each category.
                    </p>

                    <div className="flex items-center gap-3 mb-6">
                      <input
                        type="checkbox"
                        checked={formData.enableContentFilters}
                        onChange={(e) => setFormData({ ...formData, enableContentFilters: e.target.checked })}
                        className="rounded"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        Configure harmful categories filters
                      </label>
                    </div>

                    {formData.enableContentFilters && (
                      <>
                        <div className="mb-6">
                          <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center justify-between">
                            Filters for prompts
                            <button className="text-sm text-indigo-600 hover:text-indigo-700">
                              Reset thresholds
                            </button>
                          </h4>

                          <div className="flex items-center gap-3 mb-4">
                            <input
                              type="checkbox"
                              checked={formData.useSameFilters}
                              onChange={(e) => setFormData({ ...formData, useSameFilters: e.target.checked })}
                              className="rounded"
                            />
                            <label className="text-sm text-gray-900">
                              Use the same harmful categories filters for responses
                            </label>
                          </div>

                          <div className="space-y-6">
                            {categories.map((cat) => (
                              <div key={cat.id} className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-3">
                                  <div className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded" defaultChecked />
                                    <label className="text-sm font-medium text-gray-900">
                                      Text
                                    </label>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-sm font-medium text-gray-900 capitalize">
                                    {cat.label}
                                  </span>
                                </div>
                                <div className="col-span-2">
                                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option>Block</option>
                                    <option>Monitor</option>
                                  </select>
                                </div>
                                <div className="col-span-5 flex items-center gap-4">
                                  <span className="text-xs text-gray-500 w-12">None</span>
                                  <input
                                    type="range"
                                    min="0"
                                    max="3"
                                    value={cat.value}
                                    onChange={(e) => cat.onChange(parseInt(e.target.value))}
                                    className="flex-1"
                                  />
                                  <span className="text-xs text-gray-500 w-12 text-right">High</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Prompt Attacks */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Prompt attacks
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Enable to detect and block user inputs attempting to override system instructions.
                    </p>

                    <div className="flex items-center gap-3 mb-4">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm font-medium text-gray-900">
                        Configure prompt attacks filter
                      </label>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <label className="text-sm font-medium text-gray-900">
                            Text
                          </label>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm font-medium text-gray-900">
                          Prompt Attack
                        </span>
                      </div>
                      <div className="col-span-2">
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option>Block</option>
                          <option>Monitor</option>
                        </select>
                      </div>
                      <div className="col-span-5 flex items-center gap-4">
                        <span className="text-xs text-gray-500 w-12">None</span>
                        <input type="range" min="0" max="3" defaultValue="3" className="flex-1" />
                        <span className="text-xs text-gray-500 w-12 text-right">High</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Filter Tier */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Content filters tier
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Choose your prefered model tier to balance performance, accuracy, and compatibility with your existing workflows.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className={`border-2 rounded-lg p-4 cursor-pointer ${
                        formData.contentFilterTier === 'classic' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                      }`}
                      onClick={() => setFormData({ ...formData, contentFilterTier: 'classic' })}>
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="radio"
                            checked={formData.contentFilterTier === 'classic'}
                            onChange={() => setFormData({ ...formData, contentFilterTier: 'classic' })}
                            className="text-indigo-600"
                          />
                          <h4 className="text-base font-semibold text-gray-900">Classic</h4>
                        </div>
                        <p className="text-sm text-gray-600 pl-7">
                          An established solution supporting English, French, and Spanish languages. This tier does not require you to opt into cross-Region inference.
                        </p>
                      </div>

                      <div className={`border-2 rounded-lg p-4 cursor-pointer ${
                        formData.contentFilterTier === 'standard' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                      }`}
                      onClick={() => setFormData({ ...formData, contentFilterTier: 'standard' })}>
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="radio"
                            checked={formData.contentFilterTier === 'standard'}
                            onChange={() => setFormData({ ...formData, contentFilterTier: 'standard' })}
                            className="text-indigo-600"
                          />
                          <h4 className="text-base font-semibold text-gray-900">Standard</h4>
                        </div>
                        <p className="text-sm text-gray-600 pl-7">
                          An improved, more robust solution offering higher accuracy supporting over 50 languages. This tier requires you to opt into cross-Region inference.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(7)}
                    className="px-6 py-2 text-indigo-600 hover:text-indigo-700"
                  >
                    Skip to Review and create
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Denied Topics */}
            {currentStep === 3 && (
              <div className="max-w-5xl">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Add denied topics - <span className="italic font-normal">optional</span>
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Add up to 30 denied topics to block user inputs or model responses associated with the topic.
                </p>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      Denied topics ({formData.deniedTopics.length})
                    </h3>
                    <button
                      onClick={() => setShowDeniedTopicModal(true)}
                      className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
                    >
                      Add denied topic
                    </button>
                  </div>

                  {formData.deniedTopics.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No denied topics added
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Definition</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Input</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Output</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.deniedTopics.map((topic, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="px-4 py-3 text-gray-900">{topic.name}</td>
                              <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">{topic.definition}</td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-gray-600">
                                  {topic.inputEnabled ? topic.inputAction : 'Disabled'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-gray-600">
                                  {topic.outputEnabled ? topic.outputAction : 'Disabled'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleDeleteDeniedTopic(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Denied topics tier</h4>
                    <p className="text-sm text-gray-600 mb-4">The Denied topics tier to use for the guardrail.</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer ${
                          formData.deniedTopicsTier === 'classic' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                        }`}
                        onClick={() => setFormData({ ...formData, deniedTopicsTier: 'classic' })}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            checked={formData.deniedTopicsTier === 'classic'}
                            onChange={() => setFormData({ ...formData, deniedTopicsTier: 'classic' })}
                          />
                          <h5 className="text-sm font-semibold text-gray-900">Classic</h5>
                        </div>
                        <p className="text-xs text-gray-600">
                          An established solution supporting English, French, and Spanish languages.
                        </p>
                      </div>
                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer ${
                          formData.deniedTopicsTier === 'standard' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                        }`}
                        onClick={() => setFormData({ ...formData, deniedTopicsTier: 'standard' })}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            checked={formData.deniedTopicsTier === 'standard'}
                            onChange={() => setFormData({ ...formData, deniedTopicsTier: 'standard' })}
                          />
                          <h5 className="text-sm font-semibold text-gray-900">Standard</h5>
                        </div>
                        <p className="text-xs text-gray-600">
                          An improved, more robust solution offering higher accuracy supporting over 50 languages.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Denied Topic Modal */}
                <Modal
                  isOpen={showDeniedTopicModal}
                  onClose={() => setShowDeniedTopicModal(false)}
                  title="Add denied topic"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
                      <input
                        type="text"
                        placeholder="Enter name"
                        value={deniedTopicForm.name}
                        onChange={(e) => setDeniedTopicForm({ ...deniedTopicForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Valid characters are a-z, A-Z, 0-9, underscore (_), hyphen (-), space, exclamation point (!), question mark (?), and period (.). The name can have up to 100 characters.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Definition</label>
                      <p className="text-xs text-gray-600 mb-2">
                        Provide a clear definition to detect and block user inputs and FM responses that fall into this topic. Avoid starting with "don't".
                      </p>
                      <textarea
                        placeholder="Example - Investment advice refers to inquiries, guidance, or recommendations regarding the management or allocation of funds or assets with the goal of generating returns or achieving specific financial objectives."
                        value={deniedTopicForm.definition}
                        onChange={(e) => setDeniedTopicForm({ ...deniedTopicForm, definition: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm italic"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        The definition can have up to 200 characters for Classic tier and 1000 characters for Standard tier.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Input</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={deniedTopicForm.inputEnabled}
                          onChange={(e) => setDeniedTopicForm({ ...deniedTopicForm, inputEnabled: e.target.checked })}
                          className="rounded"
                        />
                        <label className="text-sm text-gray-900">Enable</label>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 block mb-2">Input action</label>
                        <p className="text-xs text-gray-600 mb-2">
                          Choose what action the guardrail should take on user inputs before they reach the model.
                        </p>
                        <select
                          value={deniedTopicForm.inputAction}
                          onChange={(e) => setDeniedTopicForm({ ...deniedTopicForm, inputAction: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option>Block</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Output</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={deniedTopicForm.outputEnabled}
                          onChange={(e) => setDeniedTopicForm({ ...deniedTopicForm, outputEnabled: e.target.checked })}
                          className="rounded"
                        />
                        <label className="text-sm text-gray-900">Enable</label>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 block mb-2">Output action</label>
                        <p className="text-xs text-gray-600 mb-2">
                          Choose what action the guardrail should take on model outputs before displayed to users.
                        </p>
                        <select
                          value={deniedTopicForm.outputAction}
                          onChange={(e) => setDeniedTopicForm({ ...deniedTopicForm, outputAction: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option>Block</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => setShowSamplePhrases(!showSamplePhrases)}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-900"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${showSamplePhrases ? 'rotate-180' : ''}`} />
                        Add sample phrases - <span className="italic font-normal">optional</span>
                      </button>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowDeniedTopicModal(false)}
                        className="px-6 py-2 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddDeniedTopic}
                        disabled={!deniedTopicForm.name || !deniedTopicForm.definition}
                        className="px-6 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white rounded-lg"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </Modal>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(7)}
                    className="px-6 py-2 text-indigo-600 hover:text-indigo-700"
                  >
                    Skip to Review and create
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Word Filters */}
            {currentStep === 4 && (
              <div className="max-w-5xl">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Add word filters - <span className="italic font-normal">optional</span>
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Use these filters to block certain words and phrases in user inputs and model responses.
                </p>

                <div className="space-y-6">
                  {/* Profanity Filter */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Profanity filter</h3>

                    <div className="flex items-start gap-3 mb-6">
                      <input
                        type="checkbox"
                        checked={formData.filterProfanity}
                        onChange={(e) => setFormData({ ...formData, filterProfanity: e.target.checked })}
                        className="mt-1 rounded"
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-900 block mb-1">
                          Filter profanity
                        </label>
                        <p className="text-sm text-gray-600">
                          Enable this feature to block profane words in user inputs and model responses. The list of words is based on the global definition of profanity and is subject to change.
                        </p>
                      </div>
                    </div>

                    {formData.filterProfanity && (
                      <>
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-4">Input</h4>
                          <div className="flex items-center gap-3 mb-2">
                            <input type="checkbox" className="rounded" disabled />
                            <label className="text-sm text-gray-500">Enable</label>
                          </div>
                          <div>
                            <label className="text-sm text-gray-700 block mb-2">Input action</label>
                            <p className="text-xs text-gray-600 mb-2">
                              Choose what action the guardrail should take on user inputs before they reach the model
                            </p>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" disabled>
                              <option>Block</option>
                            </select>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-4">Output</h4>
                          <div className="flex items-center gap-3 mb-2">
                            <input type="checkbox" className="rounded" disabled />
                            <label className="text-sm text-gray-500">Enable</label>
                          </div>
                          <div>
                            <label className="text-sm text-gray-700 block mb-2">Output action</label>
                            <p className="text-xs text-gray-600 mb-2">
                              Choose what action the guardrail should take on model outputs before displayed to users
                            </p>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" disabled>
                              <option>Block</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Custom Words */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Add custom words and phrases</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Specify up to 10,000 words or phrases (max 100 characters per) to be blocked by the guardrail. A blocked message will show if user input or model responses contain these words or phrases.
                    </p>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="wordSource" defaultChecked />
                        <div>
                          <label className="text-sm font-medium text-gray-900 block">Add words and phrases manually</label>
                          <p className="text-xs text-gray-600">Manually add words and phrases to the following table.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="wordSource" />
                        <div>
                          <label className="text-sm font-medium text-gray-900 block">Upload from a local file</label>
                          <p className="text-xs text-gray-600">Populate the following table with words and phrases from a .txt or .csv file from your computer.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="wordSource" />
                        <div>
                          <label className="text-sm font-medium text-gray-900 block">Upload from S3 object</label>
                          <p className="text-xs text-gray-600">Populate the following table with words and phrases from an S3 object.</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-900">View and edit words and phrases ({formData.customWords.length})</h4>
                        <button
                          onClick={() => setShowWordModal(true)}
                          className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                        >
                          Add
                        </button>
                      </div>

                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-2 text-left"><input type="checkbox" /></th>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">Word or phrase</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">Enable input</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">Input action</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">Enable output</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">Output action</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.customWords.map((word, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="px-4 py-3"><input type="checkbox" /></td>
                                <td className="px-4 py-3 text-gray-900">{word.phrase}</td>
                                <td className="px-4 py-3">
                                  <input type="checkbox" checked={word.inputEnabled} readOnly />
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs text-gray-600">{word.inputAction}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <input type="checkbox" checked={word.outputEnabled} readOnly />
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs text-gray-600">{word.outputAction}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                                    <Check className="w-4 h-4" />
                                    Valid
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => handleDeleteWord(index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() => setShowWordModal(true)}
                          className="px-4 py-2 text-sm text-indigo-600 border border-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          Add a word or phrase
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Word Modal */}
                <Modal
                  isOpen={showWordModal}
                  onClose={() => setShowWordModal(false)}
                  title="Add custom word or phrase"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Word or phrase</label>
                      <input
                        type="text"
                        placeholder="Enter word or phrase"
                        value={wordForm.phrase}
                        onChange={(e) => setWordForm({ ...wordForm, phrase: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Input</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={wordForm.inputEnabled}
                          onChange={(e) => setWordForm({ ...wordForm, inputEnabled: e.target.checked })}
                          className="rounded"
                        />
                        <label className="text-sm text-gray-900">Enable</label>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 block mb-2">Input action</label>
                        <select
                          value={wordForm.inputAction}
                          onChange={(e) => setWordForm({ ...wordForm, inputAction: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option>Block</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Output</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={wordForm.outputEnabled}
                          onChange={(e) => setWordForm({ ...wordForm, outputEnabled: e.target.checked })}
                          className="rounded"
                        />
                        <label className="text-sm text-gray-900">Enable</label>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 block mb-2">Output action</label>
                        <select
                          value={wordForm.outputAction}
                          onChange={(e) => setWordForm({ ...wordForm, outputAction: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option>Block</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowWordModal(false)}
                        className="px-6 py-2 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddWord}
                        disabled={!wordForm.phrase}
                        className="px-6 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white rounded-lg"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </Modal>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(7)}
                    className="px-6 py-2 text-indigo-600 hover:text-indigo-700"
                  >
                    Skip to Review and create
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Sensitive Information Filters */}
            {currentStep === 5 && (
              <div className="max-w-5xl">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Add sensitive information filters - <span className="italic font-normal">optional</span>
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Use these filters to handle any data related to privacy.
                </p>

                <div className="space-y-6">
                  {/* PII Types */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Personally Identifiable Information (PII) types
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Specify the types of PII to be filtered and the desired guardrail behavior.
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-900">PII types</h4>
                      <button
                        onClick={() => setShowPIIModal(true)}
                        className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                      >
                        Add new PII
                      </button>
                    </div>

                    {formData.piiTypes.length === 0 ? (
                      <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                        No PII types added.
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium text-gray-700">PII Type</th>
                              <th className="px-4 py-3 text-left font-medium text-gray-700">Input</th>
                              <th className="px-4 py-3 text-left font-medium text-gray-700">Output</th>
                              <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.piiTypes.map((pii, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="px-4 py-3 text-gray-900">{pii.type}</td>
                                <td className="px-4 py-3">
                                  <span className="text-xs text-gray-600">
                                    {pii.inputEnabled ? pii.inputAction : 'Disabled'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs text-gray-600">
                                    {pii.outputEnabled ? pii.outputAction : 'Disabled'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => handleDeletePII(index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* PII Modal */}
                  <Modal
                    isOpen={showPIIModal}
                    onClose={() => setShowPIIModal(false)}
                    title="Add new PII"
                  >
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">PII type</label>
                        <select
                          value={piiForm.type}
                          onChange={(e) => setPIIForm({ ...piiForm, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm italic focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Choose PII type</option>
                          {piiTypeOptions.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Input</h4>
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={piiForm.inputEnabled}
                            onChange={(e) => setPIIForm({ ...piiForm, inputEnabled: e.target.checked })}
                            className="rounded"
                          />
                          <label className="text-sm text-gray-900">Enable</label>
                        </div>
                        <div>
                          <label className="text-sm text-gray-700 block mb-2">Input action</label>
                          <p className="text-xs text-gray-600 mb-2">
                            Choose what action the guardrail should take on user inputs before they reach the model
                          </p>
                          <select
                            value={piiForm.inputAction}
                            onChange={(e) => setPIIForm({ ...piiForm, inputAction: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option>Block</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Output</h4>
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={piiForm.outputEnabled}
                            onChange={(e) => setPIIForm({ ...piiForm, outputEnabled: e.target.checked })}
                            className="rounded"
                          />
                          <label className="text-sm text-gray-900">Enable</label>
                        </div>
                        <div>
                          <label className="text-sm text-gray-700 block mb-2">Output action</label>
                          <p className="text-xs text-gray-600 mb-2">
                            Choose what action the guardrail should take on model outputs before displayed to users
                          </p>
                          <select
                            value={piiForm.outputAction}
                            onChange={(e) => setPIIForm({ ...piiForm, outputAction: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option>Block</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setShowPIIModal(false)}
                          className="px-6 py-2 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddPII}
                          disabled={!piiForm.type}
                          className="px-6 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white rounded-lg"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </Modal>

                  {/* Regex Patterns */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Regex patterns</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Add up to 10 regex patterns to filter custom types of sensitive information and specify the desired guardrail behavior.
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-900">Regex patterns</h4>
                      <button
                        onClick={() => setShowRegexModal(true)}
                        className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                      >
                        Add regex pattern
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left"><input type="checkbox" /></th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Regex pattern</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Input action</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Output action</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Description</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.regexPatterns.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                No regex patterns added.
                              </td>
                            </tr>
                          ) : (
                            formData.regexPatterns.map((regex, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="px-4 py-3"><input type="checkbox" /></td>
                                <td className="px-4 py-3 text-gray-900">{regex.name}</td>
                                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{regex.pattern}</td>
                                <td className="px-4 py-3">
                                  <span className="text-xs text-gray-600">
                                    {regex.inputEnabled ? regex.inputAction : 'Disabled'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs text-gray-600">
                                    {regex.outputEnabled ? regex.outputAction : 'Disabled'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">
                                  {regex.description || '-'}
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => handleDeleteRegex(index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Regex Modal */}
                  <Modal
                    isOpen={showRegexModal}
                    onClose={() => setShowRegexModal(false)}
                    title="Add regex pattern"
                  >
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
                        <p className="text-xs text-gray-600 mb-2">
                          Label to identify the pattern. Shown as an identifier if PII is masked, e.g. [BOOKING_ID].
                        </p>
                        <input
                          type="text"
                          placeholder="Example - Booking ID"
                          value={regexForm.name}
                          onChange={(e) => setRegexForm({ ...regexForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 italic"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Regex name can have up to 100 characters.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Regex pattern</label>
                        <input
                          type="text"
                          placeholder="Example - ^ID\d{3}[A-Z]{3}$"
                          value={regexForm.pattern}
                          onChange={(e) => setRegexForm({ ...regexForm, pattern: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm italic"
                        />
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Input</h4>
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={regexForm.inputEnabled}
                            onChange={(e) => setRegexForm({ ...regexForm, inputEnabled: e.target.checked })}
                            className="rounded"
                          />
                          <label className="text-sm text-gray-900">Enable</label>
                        </div>
                        <div>
                          <label className="text-sm text-gray-700 block mb-2">Input action</label>
                          <p className="text-xs text-gray-600 mb-2">
                            Choose what action the guardrail should take on user inputs before they reach the model
                          </p>
                          <select
                            value={regexForm.inputAction}
                            onChange={(e) => setRegexForm({ ...regexForm, inputAction: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option>Block</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Output</h4>
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={regexForm.outputEnabled}
                            onChange={(e) => setRegexForm({ ...regexForm, outputEnabled: e.target.checked })}
                            className="rounded"
                          />
                          <label className="text-sm text-gray-900">Enable</label>
                        </div>
                        <div>
                          <label className="text-sm text-gray-700 block mb-2">Output action</label>
                          <p className="text-xs text-gray-600 mb-2">
                            Choose what action the guardrail should take on model outputs before displayed to users
                          </p>
                          <select
                            value={regexForm.outputAction}
                            onChange={(e) => setRegexForm({ ...regexForm, outputAction: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option>Block</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <button
                          onClick={() => setShowRegexDescription(!showRegexDescription)}
                          className="flex items-center gap-2 text-sm font-semibold text-gray-900"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${showRegexDescription ? 'rotate-180' : ''}`} />
                          Add description - <span className="italic font-normal">optional</span>
                        </button>
                        {showRegexDescription && (
                          <textarea
                            placeholder="Enter description"
                            value={regexForm.description}
                            onChange={(e) => setRegexForm({ ...regexForm, description: e.target.value })}
                            rows={3}
                            className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                        )}
                      </div>

                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setShowRegexModal(false)}
                          className="px-6 py-2 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddRegex}
                          disabled={!regexForm.name || !regexForm.pattern}
                          className="px-6 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white rounded-lg"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </Modal>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setCurrentStep(6)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(7)}
                    className="px-6 py-2 text-indigo-600 hover:text-indigo-700"
                  >
                    Skip to Review and create
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Contextual Grounding Check */}
            {currentStep === 6 && (
              <div className="max-w-5xl">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  Add contextual grounding check - <span className="italic font-normal">optional</span>
                  <button className="text-indigo-600 hover:text-indigo-700">
                    <Info className="w-4 h-4" />
                  </button>
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Use this policy to validate if model responses are grounded in the reference source and relevant to user's query to filter model hallucination.
                </p>

                <div className="space-y-6">
                  {/* Grounding */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Grounding</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Validate if the model responses are grounded and factually correct based on the information provided in the reference source, and block responses that are below the defined threshold of grounding.
                    </p>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.enableGrounding}
                        onChange={(e) => setFormData({ ...formData, enableGrounding: e.target.checked })}
                        className="rounded w-5 h-5"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        Enable grounding check
                      </label>
                    </div>
                  </div>

                  {/* Relevance */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Relevance</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Validate if the model responses are relevant to the user's query and block responses that are below the defined threshold of relevance.
                    </p>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.enableRelevance}
                        onChange={(e) => setFormData({ ...formData, enableRelevance: e.target.checked })}
                        className="rounded w-5 h-5"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        Enable relevance check
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setCurrentStep(7)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(7)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Step 7: Review and Create */}
            {currentStep === 7 && (
              <div className="max-w-3xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Review and create
                </h2>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                      Guardrail details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="w-32 text-gray-600">Name:</span>
                        <span className="text-gray-900 font-medium">{formData.name || '(Not set)'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-600">Description:</span>
                        <span className="text-gray-900">{formData.description || '(Not set)'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                      Content filters
                    </h3>
                    <div className="text-sm text-gray-600">
                      {formData.enableContentFilters ? `Enabled with ${formData.contentFilterTier} tier` : 'Not configured'}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                      Optional configurations
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>Denied topics: {formData.deniedTopics.length} configured</div>
                      <div>Custom words: {formData.customWords.length} configured</div>
                      <div>PII types: {formData.piiTypes.length} configured</div>
                      <div>Regex patterns: {formData.regexPatterns.length} configured</div>
                      <div>Grounding check: {formData.enableGrounding ? 'Enabled' : 'Disabled'}</div>
                      <div>Relevance check: {formData.enableRelevance ? 'Enabled' : 'Disabled'}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleCreateGuardrail}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Create guardrail
                  </button>
                  <button
                    onClick={() => setCurrentStep(6)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      setShowWizard(false);
                      setFormData(getInitialFormData());
                      setCurrentStep(1);
                    }}
                    className="px-6 py-2 text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Add Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create guardrail
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton column="id" label="Guardrail ID" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton column="name" label="Name" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton column="type" label="Provider" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton column="mode" label="Mode" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Default On
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton column="createdAt" label="Created At" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton column="updatedAt" label="Updated At" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedGuardrails.map((guardrail) => (
              <tr key={guardrail.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm text-indigo-600 font-mono">
                    {guardrail.id.substring(0, 8)}...
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {guardrail.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs">🛡️</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      {getProviderLabel(guardrail.type)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {guardrail.mode}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    guardrail.enabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {guardrail.enabled ? 'Default On' : 'Default Off'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(guardrail.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(guardrail.updatedAt || guardrail.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => {
                      setGuardrailsList(guardrailsList.filter((g) => g.id !== guardrail.id));
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
