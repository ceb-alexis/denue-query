#!/usr/bin/env node

// import axios, { AxiosResponse } from "axios";
// import dayjs from "dayjs";
// import inquirer from "inquirer";
// import ora from "ora";
// import * as fs from "fs";
// import * as path from "path";
// import ExcelJS from "exceljs";
// import { SearchParams } from "./types/denue-payload.js";
// import { DenueRecord } from "./types/denue-response.js";

// const isPackaged = path.basename(process.execPath).toLowerCase() !== "node";
// const settingsPath = isPackaged ? path.join(path.dirname(process.execPath), "denue_query", ".internal", "settings") : "./data/settings";
// const outputDir = isPackaged ? path.join(path.dirname(process.execPath), "denue_query") : "./data/saved";

// const getSettingsToken = (): string | null => {
//   if (!fs.existsSync(settingsPath)) return null;
//   try {
//     const token = fs.readFileSync(settingsPath, "utf-8").trim();
//     return token !== "" ? token : null;
//   } catch (error) {
//     console.error("❌ Error al leer el token:", error);
//     return null;
//   }
// };

// const saveSettingsToken = (token: string): void => {
//   try {
//     if (!fs.existsSync(path.dirname(settingsPath))) fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
//     fs.writeFileSync(settingsPath, token, "utf-8");
//   } catch (error) {
//     console.error("❌ Error al guardar el token:", error);
//   }
// };

// const promptToken = async (existingToken: string | null): Promise<string> => {
//   console.log("\n");
//   if (existingToken) {
//     console.log(`🔑 Token encontrado: ${existingToken}`);
//     const { useExisting } = await inquirer.prompt([{ type: "confirm", name: "useExisting", message: "¿Usar este token?", default: true }]);
//     if (useExisting) return existingToken;
//   }
//   const { token } = await inquirer.prompt([
//     {
//       type: "input",
//       name: "token",
//       message: "🔒 Ingresa tu token de DENUE:",
//       validate: (input: string) => input.trim() !== "" || "El token es obligatorio",
//     },
//   ]);
//   saveSettingsToken(token);
//   return token;
// };

// const promptSearchParams = async (): Promise<SearchParams> => {
//   const { keywords } = await inquirer.prompt([
//     {
//       type: "input",
//       name: "keywords",
//       message: "🔍 Palabras clave (separadas por comas):",
//       validate: (input: string) => {
//         const trimmed = input.trim();
//         const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,]+$/;
//         if (trimmed === "") return "Ingresa al menos una palabra clave";
//         if (!regex.test(trimmed)) return "Solo se permiten letras, números y comas";
//         return true;
//       },
//     },
//   ]);

//   const { mapsUrl } = await inquirer.prompt([
//     {
//       type: "input",
//       name: "mapsUrl",
//       message: "📍 Ingresa el enlace de Google Maps:",
//       validate: (input: string) => (extractCoordinates(input) ? true : "El enlace no contiene coordenadas"),
//     },
//   ]);

//   const coords = extractCoordinates(mapsUrl);
//   if (!coords) {
//     console.error("❌ No se pudieron extraer las coordenadas.");
//     return promptSearchParams();
//   }

//   const { radius } = await inquirer.prompt([
//     {
//       type: "input",
//       name: "radius",
//       message: "📏 Ingresa el radio en metros (máx. 5000):",
//       default: "5000",
//       validate: (input: string) => {
//         const value = parseInt(input, 10);
//         if (isNaN(value)) return "Debe ser un número";
//         if (value > 5000) return "Máximo permitido es 5000";
//         return true;
//       },
//     },
//   ]);

//   return {
//     keywords,
//     latitude: coords.latitude,
//     longitude: coords.longitude,
//     radius: parseInt(radius, 10),
//   };
// };

// const extractCoordinates = (url: string): { latitude: number; longitude: number } | null => {
//   let match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
//   if (match) return { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
//   match = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
//   return match ? { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) } : null;
// };

// const fetchData = async (
//   token: string,
//   keywords: string,
//   latitude: number,
//   longitude: number,
//   radius: number
// ): Promise<DenueRecord[] | null> => {
//   const encodedSearch = encodeURIComponent(keywords);
//   const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/${encodedSearch}/${latitude},${longitude}/${radius}/${token}`;
//   const spinner = ora("⏳ Buscando...").start();
//   try {
//     const response: AxiosResponse<DenueRecord[]> = await axios.get(url, { timeout: 10000 });
//     const data = response.data;
//     if (!data || data.length === 0) throw new Error("No se encontraron registros.");
//     spinner.succeed(`✅ Búsqueda completada. Se encontraron ${data.length} registros.`);
//     return data;
//   } catch (error: any) {
//     if (error.message == "stream has been aborted") error.message = "No se encontraron registros.";
//     spinner.fail("❌ Error en la búsqueda: " + error.message);
//     return null;
//   }
// };

// const promptSaveOption = async (data: DenueRecord[], keywords: string): Promise<string | null> => {
//   const { saveOption } = await inquirer.prompt([{ type: "confirm", name: "saveOption", message: "¿Guardar resultados?", default: true }]);
//   if (!saveOption) return null;

//   const defaultName = `DENUE_${dayjs().format("YYYYMMDD_HHmmss")}_(${keywords.replace(/[\s,]+/g, "_")}).xlsx`;
//   const { fileName } = await inquirer.prompt([
//     {
//       type: "input",
//       name: "fileName",
//       message: `💾 Nombre del archivo (Enter para usar el nombre por defecto):`,
//       default: defaultName,
//     },
//   ]);
//   const finalName = fileName.trim() === "" ? defaultName : fileName.trim().endsWith(".xlsx") ? fileName.trim() : fileName.trim() + ".xlsx";
//   return finalName;
// };

// const saveAsExcel = async (data: DenueRecord[], fileName: string): Promise<void> => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Datos");
//   if (data.length) {
//     const headers = Object.keys(data[0]);
//     worksheet.addRow(headers);
//     data.forEach((record) => worksheet.addRow(headers.map((header) => record[header])));
//   }
//   if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
//   try {
//     await workbook.xlsx.writeFile(path.join(outputDir, fileName));
//     console.log(`\n📁 Guardado en: ${fileName}`);
//   } catch (error: any) {
//     console.error("❌ Error al guardar:", error.message);
//   }
// };

// const promptContinue = async (): Promise<boolean> => {
//   console.log("\n");
//   const { again } = await inquirer.prompt([{ type: "confirm", name: "again", message: "🔄 ¿Hacer otra búsqueda?", default: true }]);
//   return again;
// };

// const mainLoop = async (): Promise<void> => {
//   console.log("\n🌟 ¡Bienvenido a DENUE Query CLI!\nScript para extraer datos de DENUE a Excel.");
//   const token = await promptToken(getSettingsToken());
//   while (true) {
//     const params = await promptSearchParams();
//     const data = await fetchData(token, params.keywords, params.latitude, params.longitude, params.radius);

//     if (data) {
//       const fileName = await promptSaveOption(data, params.keywords);
//       if (fileName) await saveAsExcel(data, fileName);
//     }

//     if (!(await promptContinue())) break;
//   }
//   console.log("\n👋 ¡Hasta luego!\nCreado por @ceb.alexis | Propiedad de @GauzzMKT");
// };

// mainLoop();

import axios, { AxiosResponse } from "axios";
import dayjs from "dayjs";
import inquirer from "inquirer";
import ora from "ora";
import * as fs from "fs";
import * as path from "path";
import ExcelJS from "exceljs";
import { SearchParams } from "./types/denue-payload.js";
import { DenueRecord } from "./types/denue-response.js";

const isPackaged = path.basename(process.execPath).toLowerCase() !== "node";
const settingsPath = isPackaged ? path.join(path.dirname(process.execPath), "denue_query", ".internal", "settings") : "./data/settings";
const outputDir = isPackaged ? path.join(path.dirname(process.execPath), "denue_query") : "./data/saved";

const getSettingsToken = (): string | null => {
  if (!fs.existsSync(settingsPath)) return null;
  try {
    const token = fs.readFileSync(settingsPath, "utf-8").trim();
    return token !== "" ? token : null;
  } catch (error) {
    console.error("❌ Error al leer el token:", error);
    return null;
  }
};

const saveSettingsToken = (token: string): void => {
  try {
    if (!fs.existsSync(path.dirname(settingsPath))) fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, token, "utf-8");
  } catch (error) {
    console.error("❌ Error al guardar el token:", error);
  }
};

const promptToken = async (existingToken: string | null): Promise<string> => {
  console.log("\n");
  if (existingToken) {
    console.log(`🔑 Token encontrado: ${existingToken}`);
    const { useExisting } = await inquirer.prompt([{ type: "confirm", name: "useExisting", message: "¿Usar este token?", default: true }]);
    if (useExisting) return existingToken;
  }
  const { token } = await inquirer.prompt([
    {
      type: "input",
      name: "token",
      message: "🔒 Ingresa tu token de DENUE:",
      validate: (input: string) => input.trim() !== "" || "El token es obligatorio",
    },
  ]);
  saveSettingsToken(token);
  return token;
};

const promptQueryType = async (): Promise<string> => {
  const { queryType } = await inquirer.prompt([
    {
      type: "list",
      name: "queryType",
      message: "Seleccione el tipo de consulta:",
      choices: [
        { name: "Búsqueda simple (por coordenadas y radio)", value: "simpleSearch" },
        { name: "Búsqueda por entidad (por entidad federativa)", value: "searchByEntity" },
      ],
    },
  ]);
  return queryType;
};

const promptSimpleSearchParams = async (): Promise<SearchParams> => {
  const { keywords } = await inquirer.prompt([
    {
      type: "input",
      name: "keywords",
      message: "🔍 Palabras clave (separadas por comas):",
      default: "todos",
      validate: (input: string) => {
        const trimmed = input.trim();
        const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,]+$/;
        if (trimmed === "") return "Ingresa al menos una palabra clave";
        if (!regex.test(trimmed)) return "Solo se permiten letras, números y comas";
        return true;
      },
    },
  ]);

  const { mapsUrl } = await inquirer.prompt([
    {
      type: "input",
      name: "mapsUrl",
      message: "📍 Ingresa el enlace de Google Maps:",
      validate: (input: string) => (extractCoordinates(input) ? true : "El enlace no contiene coordenadas"),
    },
  ]);

  const coords = extractCoordinates(mapsUrl);
  if (!coords) {
    console.error("❌ No se pudieron extraer las coordenadas.");
    return promptSimpleSearchParams();
  }

  const { radius } = await inquirer.prompt([
    {
      type: "input",
      name: "radius",
      message: "📏 Ingresa el radio en metros (máx. 5000):",
      default: "5000",
      validate: (input: string) => {
        const value = parseInt(input, 10);
        if (isNaN(value)) return "Debe ser un número";
        if (value > 5000) return "Máximo permitido es 5000";
        return true;
      },
    },
  ]);

  return {
    keywords,
    latitude: coords.latitude,
    longitude: coords.longitude,
    radius: parseInt(radius, 10),
  };
};

const promptSearchByEntityParams = async (): Promise<{
  keywords: string;
  entity: string;
  registroInicial: number;
  registroFinal: number;
}> => {
  const { keywords } = await inquirer.prompt([
    {
      type: "input",
      name: "keywords",
      message: "🔍 Palabras clave (separadas por comas):",
      default: "todos",
      validate: (input: string) => {
        const trimmed = input.trim();
        const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,]+$/;
        if (trimmed === "") return "Ingresa al menos una palabra clave";
        if (!regex.test(trimmed)) return "Solo se permiten letras, números y comas";
        return true;
      },
    },
  ]);
  const { entity } = await inquirer.prompt([
    {
      type: "input",
      name: "entity",
      message: "🏛️ Ingresa la clave de la entidad federativa (dos dígitos, 00 para todas):",
      default: "00",
      validate: (input: string) => {
        const trimmed = input.trim();
        if (trimmed.length !== 2) return "La clave debe tener dos dígitos";
        if (!/^\d{2}$/.test(trimmed)) return "Solo se permiten números";
        return true;
      },
    },
  ]);
  const { registroInicial } = await inquirer.prompt([
    {
      type: "input",
      name: "registroInicial",
      message: "🔢 Ingresa el registro inicial:",
      default: "1",
      validate: (input: string) => {
        const value = parseInt(input, 10);
        if (isNaN(value) || value < 1) return "Debe ser un número mayor o igual a 1";
        return true;
      },
    },
  ]);
  const { registroFinal } = await inquirer.prompt([
    {
      type: "input",
      name: "registroFinal",
      message: "🔢 Ingresa el registro final:",
      default: "3000",
      validate: (input: string) => {
        const value = parseInt(input, 10);
        if (isNaN(value) || value < 1) return "Debe ser un número mayor o igual a 1";
        return true;
      },
    },
  ]);
  return {
    keywords: keywords.trim(),
    entity: entity.trim(),
    registroInicial: parseInt(registroInicial, 10),
    registroFinal: parseInt(registroFinal, 10),
  };
};

const extractCoordinates = (url: string): { latitude: number; longitude: number } | null => {
  let match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
  match = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  return match ? { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) } : null;
};

const fetchDataSimpleSearch = async (
  token: string,
  keywords: string,
  latitude: number,
  longitude: number,
  radius: number
): Promise<DenueRecord[] | null> => {
  const encodedSearch = encodeURIComponent(keywords);
  console.log(encodedSearch);
  const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/${encodedSearch}/${latitude},${longitude}/${radius}/${token}`;
  const spinner = ora("⏳ Buscando...").start();
  try {
    const response: AxiosResponse<DenueRecord[]> = await axios.get(url, { timeout: 10000 });
    const data = response.data;
    if (!data || data.length === 0) throw new Error("No se encontraron registros.");
    spinner.succeed(`✅ Búsqueda completada. Se encontraron ${data.length} registros.`);
    return data;
  } catch (error: any) {
    if (error.message == "stream has been aborted") error.message = "No se encontraron registros.";
    spinner.fail("❌ Error en la búsqueda: " + error.message);
    return null;
  }
};

const fetchDataSearchByEntity = async (
  token: string,
  keywords: string,
  entity: string,
  registroInicial: number,
  registroFinal: number
): Promise<DenueRecord[] | null> => {
  const encodedSearch = encodeURIComponent(keywords);
  const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/BuscarEntidad/${encodedSearch}/${entity}/${registroInicial}/${registroFinal}/${token}`;
  const spinner = ora("⏳ Buscando por entidad...").start();
  try {
    const response: AxiosResponse<DenueRecord[]> = await axios.get(url, { timeout: 10000 });
    const data = response.data;
    if (!data || data.length === 0) throw new Error("No se encontraron registros.");
    spinner.succeed(`✅ Búsqueda completada. Se encontraron ${data.length} registros.`);
    return data;
  } catch (error: any) {
    if (error.message == "stream has been aborted") error.message = "No se encontraron registros.";
    spinner.fail("❌ Error en la búsqueda: " + error.message);
    return null;
  }
};

const promptSaveOption = async (data: DenueRecord[], queryIdentifier: string): Promise<string | null> => {
  const { saveOption } = await inquirer.prompt([{ type: "confirm", name: "saveOption", message: "¿Guardar resultados?", default: true }]);
  if (!saveOption) return null;

  const defaultName = `DENUE_${dayjs().format("YYYYMMDD_HHmmss")}_(${queryIdentifier.replace(/[\s,]+/g, "_")}).xlsx`;
  const { fileName } = await inquirer.prompt([
    {
      type: "input",
      name: "fileName",
      message: `💾 Nombre del archivo (Enter para usar el nombre por defecto):`,
      default: defaultName,
    },
  ]);
  const finalName = fileName.trim() === "" ? defaultName : fileName.trim().endsWith(".xlsx") ? fileName.trim() : fileName.trim() + ".xlsx";
  return finalName;
};

const saveAsExcel = async (data: DenueRecord[], fileName: string): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Datos");
  if (data.length) {
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
    data.forEach((record) => worksheet.addRow(headers.map((header) => record[header])));
  }
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  try {
    await workbook.xlsx.writeFile(path.join(outputDir, fileName));
    console.log(`\n📁 Guardado en: ${fileName}`);
  } catch (error: any) {
    console.error("❌ Error al guardar:", error.message);
  }
};

const promptContinue = async (): Promise<boolean> => {
  console.log("\n");
  const { again } = await inquirer.prompt([{ type: "confirm", name: "again", message: "🔄 ¿Hacer otra búsqueda?", default: true }]);
  return again;
};

const mainLoop = async (): Promise<void> => {
  console.log("\n🌟 ¡Bienvenido a DENUE Query CLI!\nScript para extraer datos de DENUE a Excel.");

  const token = await promptToken(getSettingsToken());
  while (true) {
    let queryIdentifier = "";
    const queryType = await promptQueryType();

    let data: DenueRecord[] | null = null;

    if (queryType === "simpleSearch") {
      const paramsSimpleSearch = await promptSimpleSearchParams();
      queryIdentifier = paramsSimpleSearch.keywords;
      data = await fetchDataSimpleSearch(
        token,
        paramsSimpleSearch.keywords,
        paramsSimpleSearch.latitude,
        paramsSimpleSearch.longitude,
        paramsSimpleSearch.radius
      );
    }

    if (queryType === "searchByEntity") {
      const paramsSearchByEntity = await promptSearchByEntityParams();
      queryIdentifier = paramsSearchByEntity.keywords;
      data = await fetchDataSearchByEntity(
        token,
        paramsSearchByEntity.keywords,
        paramsSearchByEntity.entity,
        paramsSearchByEntity.registroInicial,
        paramsSearchByEntity.registroFinal
      );
    }

    if (data) {
      const fileName = await promptSaveOption(data, queryIdentifier);
      if (fileName) await saveAsExcel(data, fileName);
    }

    if (!(await promptContinue())) break;
  }
  console.log("\n👋 ¡Hasta luego!\nCreado por @ceb.alexis | Propiedad de @GauzzMKT");
};

mainLoop();
