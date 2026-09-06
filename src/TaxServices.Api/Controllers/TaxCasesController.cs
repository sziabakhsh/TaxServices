using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxServices.Application.DTOs.Cases;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TaxCasesController : ControllerBase
    {
        private readonly ITaxCaseService _taxCaseService;

        public TaxCasesController(ITaxCaseService taxCaseService)
        {
            _taxCaseService = taxCaseService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaxCaseResponse>>> GetAll()
        {
            var taxCases = await _taxCaseService.GetAllAsync();

            return Ok(taxCases);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<TaxCaseResponse>> GetById(Guid id)
        {
            var taxCase = await _taxCaseService.GetByIdAsync(id);

            if (taxCase == null)
                return NotFound();

            return Ok(taxCase);
        }

        [HttpPost]
        public async Task<ActionResult<TaxCaseResponse>> Create(
            CreateTaxCaseRequest request)
        {
            var taxCase = await _taxCaseService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = taxCase.Id },
                taxCase);
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<TaxCaseResponse>> Update(
            Guid id,
            UpdateTaxCaseRequest request)
        {
            var taxCase = await _taxCaseService.UpdateAsync(id, request);

            return Ok(taxCase);
        }
    }
}