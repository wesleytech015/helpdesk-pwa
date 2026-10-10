export function validarChamado(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    throw new Error("Os dados do chamado devem ser um objeto.");
  }

  if (typeof dados.titulo !== "string" || !dados.titulo.trim()) {
    throw new Error("O título do chamado é obrigatório.");
  }



  if (typeof dados.descricao !== "string" || !dados.descricao.trim()) {
  throw new Error("A descrição do chamado é obrigatória.");
}

}

