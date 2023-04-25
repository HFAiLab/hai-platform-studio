import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Code2RC } from '@hai-platform/studio-pages/lib/ui-components/highlightCode'
import React, { useEffect, useState } from 'react'
import { GlobalAilabServerClient } from '../../../../api/ailabServer'

export const ContainerDetail = (props: { schema: Record<string, unknown> }) => {
  const [yamlText, setYamlText] = useState<string | null>(null)
  useEffect(() => {
    GlobalAilabServerClient.request(AilabServerApiName.YAML_STRINGIFY, undefined, {
      data: {
        content: props.schema,
      },
    }).then((yaml) => {
      setYamlText(yaml.results as string)
      return yaml.results
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container-detail-container">
      <div>{i18n.t(i18nKeys.biz_container_yaml_config)}</div>
      <pre className="hf-basic-code container-yaml-container">
        <Code2RC code={yamlText || ''} lang="yaml" />
      </pre>
    </div>
  )
}
